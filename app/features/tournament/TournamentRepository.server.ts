import type { NotNull, Transaction } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { CastedMatchesInfo, DB, Tables } from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS, userChatNameColor } from "~/utils/kysely.server";

export async function findById(id: number) {
  const result = await db
    .selectFrom("Tournament")
    .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select(({ eb, exists, selectFrom }) => [
      "Tournament.id",
      "CalendarEvent.id as eventId",
      "Tournament.settings",
      "Tournament.showMapListGenerator",
      "Tournament.castTwitchAccounts",
      "Tournament.castedMatchesInfo",
      "Tournament.mapPickingStyle",
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEventDate.startTime",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .select([...COMMON_USER_FIELDS, userChatNameColor])
          .whereRef("User.id", "=", "CalendarEvent.authorId"),
      ).as("author"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStaff")
          .innerJoin("User", "TournamentStaff.userId", "User.id")
          .select([
            ...COMMON_USER_FIELDS,
            userChatNameColor,
            "TournamentStaff.role",
          ])
          .where("TournamentStaff.tournamentId", "=", id),
      ).as("staff"),
      exists(
        selectFrom("TournamentResult")
          .where("TournamentResult.tournamentId", "=", id)
          .select("TournamentResult.tournamentId"),
      ).as("isFinalized"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStage")
          .select([
            "TournamentStage.id",
            "TournamentStage.name",
            "TournamentStage.type",
            "TournamentStage.createdAt",
          ])
          .where("TournamentStage.tournamentId", "=", id)
          .orderBy("TournamentStage.number asc"),
      ).as("inProgressBrackets"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentTeam")
          .select(({ eb: innerEb }) => [
            "TournamentTeam.id",
            "TournamentTeam.name",
            "TournamentTeam.seed",
            "TournamentTeam.prefersNotToHost",
            "TournamentTeam.inviteCode",
            "TournamentTeam.createdAt",
            jsonArrayFrom(
              innerEb
                .selectFrom("TournamentTeamMember")
                .innerJoin("User", "TournamentTeamMember.userId", "User.id")
                .leftJoin("PlusTier", "User.id", "PlusTier.userId")
                .select([
                  "User.id as userId",
                  "User.discordName",
                  "User.discordId",
                  "User.discordAvatar",
                  "User.customUrl",
                  "User.inGameName",
                  "User.country",
                  "PlusTier.tier as plusTier",
                  "TournamentTeamMember.isOwner",
                  "TournamentTeamMember.createdAt",
                ])
                .whereRef(
                  "TournamentTeamMember.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                )
                .orderBy("TournamentTeamMember.createdAt asc"),
            ).as("members"),
            jsonArrayFrom(
              innerEb
                .selectFrom("TournamentTeamCheckIn")
                .select([
                  "TournamentTeamCheckIn.bracketIdx",
                  "TournamentTeamCheckIn.checkedInAt",
                ])
                .whereRef(
                  "TournamentTeamCheckIn.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                ),
            ).as("checkIns"),
            jsonArrayFrom(
              innerEb
                .selectFrom("MapPoolMap")
                .whereRef(
                  "MapPoolMap.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                )
                .select(["MapPoolMap.stageId", "MapPoolMap.mode"]),
            ).as("mapPool"),
          ])
          .where("TournamentTeam.tournamentId", "=", id)
          .orderBy(["TournamentTeam.seed asc", "TournamentTeam.createdAt asc"]),
      ).as("teams"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentRound")
          .innerJoin(
            "TournamentMatch",
            "TournamentMatch.roundId",
            "TournamentRound.id",
          )
          .innerJoin(
            "TournamentStage",
            "TournamentRound.stageId",
            "TournamentStage.id",
          )
          .select(["TournamentRound.id as roundId", "TournamentMatch.bestOf"])
          .groupBy("roundId")
          .where("TournamentStage.tournamentId", "=", id),
      ).as("bestOfs"),
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
          .whereRef(
            "MapPoolMap.tieBreakerCalendarEventId",
            "=",
            "CalendarEvent.id",
          ),
      ).as("tieBreakerMapPool"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStage")
          .innerJoin(
            "TournamentMatch",
            "TournamentMatch.stageId",
            "TournamentStage.id",
          )
          .innerJoin(
            "TournamentMatchGameResult",
            "TournamentMatch.id",
            "TournamentMatchGameResult.matchId",
          )
          .innerJoin(
            "TournamentMatchGameResultParticipant",
            "TournamentMatchGameResult.id",
            "TournamentMatchGameResultParticipant.matchGameResultId",
          )
          .select("TournamentMatchGameResultParticipant.userId")
          .groupBy("TournamentMatchGameResultParticipant.userId")
          .where("TournamentStage.tournamentId", "=", id),
      ).as("participatedUsers"),
    ])
    .where("Tournament.id", "=", id)
    .$narrowType<{ author: NotNull }>()
    .executeTakeFirst();

  if (!result) return null;

  return {
    ...result,
    participatedUsers: result.participatedUsers.map((user) => user.userId),
  };
}

export async function findCastTwitchAccountsByTournamentId(
  tournamentId: number,
) {
  const result = await db
    .selectFrom("Tournament")
    .select("castTwitchAccounts")
    .where("id", "=", tournamentId)
    .executeTakeFirst();

  if (!result) return null;

  return result.castTwitchAccounts;
}

export function checkedInTournamentTeamsByBracket({
  tournamentId,
  bracketIdx,
}: {
  tournamentId: number;
  bracketIdx: number;
}) {
  return db
    .selectFrom("TournamentTeamCheckIn")
    .innerJoin(
      "TournamentTeam",
      "TournamentTeamCheckIn.tournamentTeamId",
      "TournamentTeam.id",
    )
    .select(["TournamentTeamCheckIn.tournamentTeamId"])
    .where("TournamentTeamCheckIn.bracketIdx", "=", bracketIdx)
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .execute();
}

export async function friendCodesByTournamentId(tournamentId: number) {
  const values = await db
    .selectFrom("TournamentTeam")
    .innerJoin(
      "TournamentTeamMember",
      "TournamentTeam.id",
      "TournamentTeamMember.tournamentTeamId",
    )
    .innerJoin(
      "UserFriendCode",
      "TournamentTeamMember.userId",
      "UserFriendCode.userId",
    )
    .select(["TournamentTeamMember.userId", "UserFriendCode.friendCode"])
    .orderBy("UserFriendCode.createdAt asc")
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .execute();

  // later friend code overwrites earlier ones
  return values.reduce(
    (acc, cur) => {
      acc[cur.userId] = cur.friendCode;
      return acc;
    },
    {} as Record<number, string>,
  );
}

export function checkIn({
  tournamentTeamId,
  bracketIdx,
}: {
  tournamentTeamId: number;
  bracketIdx: number | null;
}) {
  return db
    .insertInto("TournamentTeamCheckIn")
    .values({
      checkedInAt: dateToDatabaseTimestamp(new Date()),
      tournamentTeamId,
      bracketIdx,
    })
    .execute();
}

export function checkOut({
  tournamentTeamId,
  bracketIdx,
}: {
  tournamentTeamId: number;
  bracketIdx: number | null;
}) {
  let query = db
    .deleteFrom("TournamentTeamCheckIn")
    .where("TournamentTeamCheckIn.tournamentTeamId", "=", tournamentTeamId);

  if (typeof bracketIdx === "number") {
    query = query.where("TournamentTeamCheckIn.bracketIdx", "=", bracketIdx);
  }

  return query.execute();
}

export function checkInMany({
  tournamentTeamIds,
  bracketIdx,
}: {
  tournamentTeamIds: number[];
  bracketIdx: number;
}) {
  return db
    .insertInto("TournamentTeamCheckIn")
    .values(
      tournamentTeamIds.map((tournamentTeamId) => ({
        checkedInAt: dateToDatabaseTimestamp(new Date()),
        tournamentTeamId,
        bracketIdx,
      })),
    )
    .execute();
}

export function addStaff({
  tournamentId,
  userId,
  role,
}: {
  tournamentId: number;
  userId: number;
  role: Tables["TournamentStaff"]["role"];
}) {
  return db
    .insertInto("TournamentStaff")
    .values({
      tournamentId,
      userId,
      role,
    })
    .execute();
}

export function removeStaff({
  tournamentId,
  userId,
}: {
  tournamentId: number;
  userId: number;
}) {
  return db
    .deleteFrom("TournamentStaff")
    .where("tournamentId", "=", tournamentId)
    .where("userId", "=", userId)
    .execute();
}

export function updateCastTwitchAccounts({
  tournamentId,
  castTwitchAccounts,
}: {
  tournamentId: number;
  castTwitchAccounts: string[];
}) {
  return db
    .updateTable("Tournament")
    .set({
      castTwitchAccounts: JSON.stringify(castTwitchAccounts),
    })
    .where("id", "=", tournamentId)
    .execute();
}

const castedMatchesInfoByTournamentId = async (
  trx: Transaction<DB>,
  tournamentId: number,
) =>
  (
    await trx
      .selectFrom("Tournament")
      .select("castedMatchesInfo")
      .where("id", "=", tournamentId)
      .executeTakeFirstOrThrow()
  ).castedMatchesInfo ??
  ({
    castedMatches: [],
    lockedMatches: [],
  } as CastedMatchesInfo);

export function lockMatch({
  matchId,
  tournamentId,
}: {
  matchId: number;
  tournamentId: number;
}) {
  return db.transaction().execute(async (trx) => {
    const castedMatchesInfo = await castedMatchesInfoByTournamentId(
      trx,
      tournamentId,
    );

    if (!castedMatchesInfo.lockedMatches.includes(matchId)) {
      castedMatchesInfo.lockedMatches.push(matchId);
    }

    await trx
      .updateTable("Tournament")
      .set({
        castedMatchesInfo: JSON.stringify(castedMatchesInfo),
      })
      .where("id", "=", tournamentId)
      .execute();
  });
}

export function unlockMatch({
  matchId,
  tournamentId,
}: {
  matchId: number;
  tournamentId: number;
}) {
  return db.transaction().execute(async (trx) => {
    const castedMatchesInfo = await castedMatchesInfoByTournamentId(
      trx,
      tournamentId,
    );

    castedMatchesInfo.lockedMatches = castedMatchesInfo.lockedMatches.filter(
      (lockedMatchId) => lockedMatchId !== matchId,
    );

    await trx
      .updateTable("Tournament")
      .set({
        castedMatchesInfo: JSON.stringify(castedMatchesInfo),
      })
      .where("id", "=", tournamentId)
      .execute();
  });
}

export function setMatchAsCasted({
  matchId,
  tournamentId,
  twitchAccount,
}: {
  matchId: number;
  tournamentId: number;
  twitchAccount: string | null;
}) {
  return db.transaction().execute(async (trx) => {
    const castedMatchesInfo = await castedMatchesInfoByTournamentId(
      trx,
      tournamentId,
    );

    let newCastedMatchesInfo: CastedMatchesInfo;
    if (twitchAccount === null) {
      newCastedMatchesInfo = {
        ...castedMatchesInfo,
        castedMatches: castedMatchesInfo.castedMatches.filter(
          (cm) => cm.matchId !== matchId,
        ),
      };
    } else {
      newCastedMatchesInfo = {
        ...castedMatchesInfo,
        castedMatches: castedMatchesInfo.castedMatches
          .filter(
            (cm) =>
              // currently a match can only  be streamed by one account
              // and a cast can only stream one match at a time
              // these can change in the future
              cm.matchId !== matchId && cm.twitchAccount !== twitchAccount,
          )
          .concat([{ twitchAccount, matchId }]),
      };
    }

    await trx
      .updateTable("Tournament")
      .set({
        castedMatchesInfo: JSON.stringify(newCastedMatchesInfo),
      })
      .where("id", "=", tournamentId)
      .execute();
  });
}
