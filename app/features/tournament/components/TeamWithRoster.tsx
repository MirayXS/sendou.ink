import { Link } from "@remix-run/react";
import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import { ModeImage, StageImage } from "~/components/Image";
import type { MapPoolMap, User } from "~/db/types";
import type { TournamentDataTeam } from "~/features/tournament-bracket/core/Tournament.server";
import { userPage } from "~/utils/urls";
import { useTournament, useTournamentFriendCodes } from "../routes/to.$id";
import { databaseTimestampToDate } from "~/utils/dates";

export function TeamWithRoster({
  team,
  mapPool,
  seed,
  teamPageUrl,
  activePlayers,
}: {
  team: TournamentDataTeam;
  mapPool?: Array<Pick<MapPoolMap, "stageId" | "mode">> | null;
  seed?: number;
  teamPageUrl?: string;
  activePlayers?: User["id"][];
}) {
  const tournament = useTournament();
  const friendCodes = useTournamentFriendCodes();

  return (
    <div>
      <div className="tournament__team-with-roster">
        <div className="tournament__team-with-roster__name">
          {seed ? (
            <span className="tournament__team-with-roster__seed">#{seed}</span>
          ) : null}{" "}
          {teamPageUrl ? <Link to={teamPageUrl}>{team.name}</Link> : team.name}
        </div>
        <ul className="tournament__team-with-roster__members">
          {team.members.map((member) => {
            const friendCode = friendCodes?.[member.userId];
            const isSub =
              databaseTimestampToDate(member.createdAt) >
              tournament.ctx.startTime;

            return (
              <li key={member.userId} className="list-none">
                <div
                  className={clsx("tournament__team-with-roster__member", {
                    "tournament__team-with-roster__member__inactive":
                      activePlayers && !activePlayers.includes(member.userId),
                  })}
                >
                  <Avatar
                    user={member}
                    size="xxs"
                    className={
                      activePlayers && !activePlayers.includes(member.userId)
                        ? "tournament__team-with-roster__member__avatar-inactive"
                        : undefined
                    }
                  />
                  <Link
                    to={userPage(member)}
                    className="tournament__team-member-name"
                  >
                    {member.discordName}{" "}
                    {member.isOwner ? (
                      <span className="tournament__team-member-name__role text-theme">
                        (C)
                      </span>
                    ) : null}
                    {isSub ? (
                      <span className="tournament__team-member-name__role text-info">
                        Sub
                      </span>
                    ) : null}
                  </Link>
                </div>
                {friendCode ? (
                  <div className="text-xs text-lighter">SW-{friendCode}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      {mapPool && mapPool.length > 0 ? <TeamMapPool mapPool={mapPool} /> : null}
    </div>
  );
}

function TeamMapPool({
  mapPool,
}: {
  mapPool: Array<Pick<MapPoolMap, "stageId" | "mode">>;
}) {
  return (
    <div
      className={clsx("tournament__team-with-roster__map-pool", {
        "tournament__team-with-roster__map-pool__3-columns":
          mapPool.length % 3 === 0,
      })}
    >
      {mapPool.map(({ mode, stageId }, i) => {
        return (
          <div key={i}>
            <StageImage stageId={stageId} width={85} />
            <div className="tournament__team-with-roster__map-pool__mode-info">
              <ModeImage mode={mode} size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
