import invariant from "tiny-invariant";
import type { Tables, TournamentBracketProgression } from "~/db/tables";
import { TOURNAMENT } from "~/features/tournament";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import { assertUnreachable } from "~/utils/types";
import type { OptionalIdObject, Tournament } from "./Tournament";
import type { TournamentDataTeam } from "./Tournament.server";
import { removeDuplicates } from "~/utils/arrays";
import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";
import { logger } from "~/utils/logger";
import type { Round } from "~/modules/brackets-model";
import { getTournamentManager } from "..";

interface CreateBracketArgs {
  id: number;
  preview: boolean;
  data: ValueToArray<DataTypes>;
  type: Tables["TournamentStage"]["type"];
  canBeStarted?: boolean;
  name: string;
  teamsPendingCheckIn?: number[];
  tournament: Tournament;
  createdAt: number | null;
  sources?: {
    bracketIdx: number;
    placements: number[];
  }[];
  seeding?: {
    id: number;
    name: string;
  }[];
}

export interface Standing {
  team: TournamentDataTeam;
  placement: number; // 1st, 2nd, 3rd, 4th, 5th, 5th...
  groupId?: number;
  stats?: {
    setWins: number;
    setLosses: number;
    mapWins: number;
    mapLosses: number;
    points: number;
    winsAgainstTied: number;
  };
}

export abstract class Bracket {
  id;
  preview;
  data;
  simulatedData: ValueToArray<DataTypes> | undefined;
  canBeStarted;
  name;
  teamsPendingCheckIn;
  tournament;
  sources;
  createdAt;
  seeding;

  constructor({
    id,
    preview,
    data,
    canBeStarted,
    name,
    teamsPendingCheckIn,
    tournament,
    sources,
    createdAt,
    seeding,
  }: Omit<CreateBracketArgs, "format">) {
    this.id = id;
    this.preview = preview;
    this.data = data;
    this.canBeStarted = canBeStarted;
    this.name = name;
    this.teamsPendingCheckIn = teamsPendingCheckIn;
    this.tournament = tournament;
    this.sources = sources;
    this.createdAt = createdAt;
    this.seeding = seeding;

    this.createdSimulation();
  }

  private createdSimulation() {
    if (
      this.type === "round_robin" ||
      this.preview ||
      this.tournament.ctx.isFinalized
    )
      return;

    try {
      const manager = getTournamentManager("IN_MEMORY");

      manager.import(this.data);

      const teamOrder = this.teamOrderForSimulation();

      let matchesToResolve = true;
      let loopCount = 0;
      while (matchesToResolve) {
        if (loopCount > 100) {
          logger.error("Bracket.createdSimulation: loopCount > 100");
          break;
        }
        matchesToResolve = false;
        loopCount++;

        for (const match of manager.export().match) {
          if (!match) continue;
          // we have a result already
          if (
            match.opponent1?.result === "win" ||
            match.opponent2?.result === "win"
          ) {
            continue;
          }
          // no opponent yet, let's simulate this in a coming loop
          if (
            (match.opponent1 && !match.opponent1.id) ||
            (match.opponent2 && !match.opponent2.id)
          ) {
            matchesToResolve = true;
            continue;
          }
          // BYE
          if (match.opponent1 === null || match.opponent2 === null) {
            continue;
          }

          const winner =
            (teamOrder.get(match.opponent1.id!) ?? 0) <
            (teamOrder.get(match.opponent2.id!) ?? 0)
              ? 1
              : 2;

          manager.update.match({
            id: match.id,
            opponent1: {
              score: winner === 1 ? 1 : 0,
              result: winner === 1 ? "win" : undefined,
            },
            opponent2: {
              score: winner === 2 ? 1 : 0,
              result: winner === 2 ? "win" : undefined,
            },
          });
        }
      }

      this.simulatedData = manager.export();
    } catch (e) {
      logger.error("Bracket.createdSimulation: ", e);
    }
  }

  private teamOrderForSimulation() {
    const result = new Map(this.tournament.ctx.teams.map((t, i) => [t.id, i]));

    for (const match of this.data.match) {
      if (
        !match.opponent1?.id ||
        !match.opponent2?.id ||
        (match.opponent1?.result !== "win" && match.opponent2?.result !== "win")
      ) {
        continue;
      }

      const opponent1Seed = result.get(match.opponent1.id) ?? -1;
      const opponent2Seed = result.get(match.opponent2.id) ?? -1;
      if (opponent1Seed === -1 || opponent2Seed === -1) {
        console.error("opponent1Seed or opponent2Seed not found");
        continue;
      }

      if (opponent1Seed < opponent2Seed && match.opponent1?.result === "win") {
        continue;
      }

      if (opponent2Seed < opponent1Seed && match.opponent2?.result === "win") {
        continue;
      }

      if (opponent1Seed < opponent2Seed) {
        result.set(match.opponent1.id, opponent1Seed + 0.1);
        result.set(match.opponent2.id, opponent1Seed);
      } else {
        result.set(match.opponent2.id, opponent2Seed + 0.1);
        result.set(match.opponent1.id, opponent2Seed);
      }
    }

    return result;
  }

  simulatedMatch(matchId: number) {
    if (!this.simulatedData) return;

    return this.simulatedData.match
      .filter(Boolean)
      .find((match) => match.id === matchId);
  }

  get collectResultsWithPoints() {
    return false;
  }

  get type(): TournamentBracketProgression[number]["type"] {
    throw new Error("not implemented");
  }

  get standings(): Standing[] {
    throw new Error("not implemented");
  }

  currentStandings(_includeUnfinishedGroups: boolean) {
    return this.standings;
  }

  winnersSourceRound(_roundNumber: number): Round | undefined {
    return;
  }

  protected standingsWithoutNonParticipants(standings: Standing[]): Standing[] {
    return standings.map((standing) => {
      return {
        ...standing,
        team: {
          ...standing.team,
          members: standing.team.members.filter((member) =>
            this.tournament.ctx.participatedUsers.includes(member.userId),
          ),
        },
      };
    });
  }

  get isUnderground() {
    return this.name === BRACKET_NAMES.UNDERGROUND;
  }

  get everyMatchOver() {
    if (this.preview) return false;

    for (const match of this.data.match) {
      // BYE
      if (match.opponent1 === null || match.opponent2 === null) {
        continue;
      }
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        return false;
      }
    }

    return true;
  }

  get enoughTeams() {
    return this.data.participant.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START;
  }

  canCheckIn(user: OptionalIdObject) {
    // using regular check-in
    if (!this.teamsPendingCheckIn) return false;

    const team = this.tournament.ownedTeamByUser(user);
    if (!team) return false;

    return this.teamsPendingCheckIn.includes(team.id);
  }

  source(_placements: number[]): {
    relevantMatchesFinished: boolean;
    teams: { id: number; name: string }[];
  } {
    throw new Error("not implemented");
  }

  teamsWithNames(teams: { id: number }[]) {
    return teams.map((team) => {
      const name = this.data.participant.find(
        (participant) => participant.id === team.id,
      )?.name;
      invariant(name, `Team name not found for id: ${team.id}`);

      return {
        id: team.id,
        name,
      };
    });
  }

  static create(
    args: CreateBracketArgs,
  ): SingleEliminationBracket | DoubleEliminationBracket | RoundRobinBracket {
    switch (args.type) {
      case "single_elimination": {
        return new SingleEliminationBracket(args);
      }
      case "double_elimination": {
        return new DoubleEliminationBracket(args);
      }
      case "round_robin": {
        return new RoundRobinBracket(args);
      }
      default: {
        assertUnreachable(args.type);
      }
    }
  }
}

class SingleEliminationBracket extends Bracket {
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "single_elimination";
  }

  get standings(): Standing[] {
    const teams: { id: number; lostAt: number }[] = [];

    for (const match of this.data.match
      .slice()
      .sort((a, b) => a.round_id - b.round_id)) {
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        continue;
      }

      const loser =
        match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
      invariant(loser?.id, "Loser id not found");

      teams.push({ id: loser.id, lostAt: match.round_id });
    }

    const teamCountWhoDidntLoseYet =
      this.data.participant.length - teams.length;

    const result: Standing[] = [];
    for (const roundId of removeDuplicates(teams.map((team) => team.lostAt))) {
      const teamsLostThisRound: { id: number }[] = [];
      while (teams.length && teams[0].lostAt === roundId) {
        teamsLostThisRound.push(teams.shift()!);
      }

      for (const { id: teamId } of teamsLostThisRound) {
        const team = this.tournament.teamById(teamId);
        invariant(team, `Team not found for id: ${teamId}`);

        const teamsPlacedAbove = teamCountWhoDidntLoseYet + teams.length;

        result.push({
          team,
          placement: teamsPlacedAbove + 1,
        });
      }
    }

    if (teamCountWhoDidntLoseYet === 1) {
      const winner = this.data.participant.find((participant) =>
        result.every(({ team }) => team.id !== participant.id),
      );
      invariant(winner, "No winner identified");

      const winnerTeam = this.tournament.teamById(winner.id);
      invariant(winnerTeam, `Winner team not found for id: ${winner.id}`);

      result.push({
        team: winnerTeam,
        placement: 1,
      });
    }

    // TODO: 3rd place match

    return this.standingsWithoutNonParticipants(result.reverse());
  }
}

class DoubleEliminationBracket extends Bracket {
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "double_elimination";
  }

  winnersSourceRound(roundNumber: number) {
    const isMajorRound = roundNumber === 1 || roundNumber % 2 === 0;
    if (!isMajorRound) return;

    const roundNumberWB = Math.ceil((roundNumber + 1) / 2);

    const groupIdWB = this.data.group.find((g) => g.number === 1)?.id;

    return this.data.round.find(
      (round) => round.number === roundNumberWB && round.group_id === groupIdWB,
    );
  }

  get standings(): Standing[] {
    const losersGroupId = this.data.group.find((g) => g.number === 2)?.id;

    const teams: { id: number; lostAt: number }[] = [];

    for (const match of this.data.match
      .slice()
      .sort((a, b) => a.round_id - b.round_id)) {
      if (match.group_id !== losersGroupId) continue;

      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        continue;
      }

      // BYE
      if (!match.opponent1 || !match.opponent2) continue;

      const loser =
        match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
      invariant(loser?.id, "Loser id not found");

      teams.push({ id: loser.id, lostAt: match.round_id });
    }

    const teamCountWhoDidntLoseInLosersYet =
      this.data.participant.length - teams.length;

    const result: Standing[] = [];
    for (const roundId of removeDuplicates(teams.map((team) => team.lostAt))) {
      const teamsLostThisRound: { id: number }[] = [];
      while (teams.length && teams[0].lostAt === roundId) {
        teamsLostThisRound.push(teams.shift()!);
      }

      for (const { id: teamId } of teamsLostThisRound) {
        const team = this.tournament.teamById(teamId);
        invariant(team, `Team not found for id: ${teamId}`);

        const teamsPlacedAbove =
          teamCountWhoDidntLoseInLosersYet + teams.length;

        result.push({
          team,
          placement: teamsPlacedAbove + 1,
        });
      }
    }

    // edge case: 1 match only
    const noLosersRounds = !losersGroupId;
    const grandFinalsNumber = noLosersRounds ? 1 : 3;
    const grandFinalsGroupId = this.data.group.find(
      (g) => g.number === grandFinalsNumber,
    )?.id;
    invariant(grandFinalsGroupId, "GF group not found");
    const grandFinalMatches = this.data.match.filter(
      (match) => match.group_id === grandFinalsGroupId,
    );

    // if opponent1 won in DE it means that bracket reset is not played
    if (
      grandFinalMatches[0].opponent1 &&
      (noLosersRounds || grandFinalMatches[0].opponent1.result === "win")
    ) {
      const loserTeam = this.tournament.teamById(
        grandFinalMatches[0].opponent2!.id!,
      );
      invariant(loserTeam, "Loser team not found");
      const winnerTeam = this.tournament.teamById(
        grandFinalMatches[0].opponent1.id!,
      );
      invariant(winnerTeam, "Winner team not found");

      result.push({
        team: loserTeam,
        placement: 2,
      });

      result.push({
        team: winnerTeam,
        placement: 1,
      });
    } else if (
      grandFinalMatches[1].opponent1?.result === "win" ||
      grandFinalMatches[1].opponent2?.result === "win"
    ) {
      const loser =
        grandFinalMatches[1].opponent1?.result === "win"
          ? "opponent2"
          : "opponent1";
      const winner = loser === "opponent1" ? "opponent2" : "opponent1";

      const loserTeam = this.tournament.teamById(
        grandFinalMatches[1][loser]!.id!,
      );
      invariant(loserTeam, "Loser team not found");
      const winnerTeam = this.tournament.teamById(
        grandFinalMatches[1][winner]!.id!,
      );
      invariant(winnerTeam, "Winner team not found");

      result.push({
        team: loserTeam,
        placement: 2,
      });

      result.push({
        team: winnerTeam,
        placement: 1,
      });
    }

    return this.standingsWithoutNonParticipants(result.reverse());
  }

  get everyMatchOver() {
    if (this.preview) return false;

    let lastWinner = -1;
    for (const [i, match] of this.data.match.entries()) {
      // special case - bracket reset might not be played depending on who wins in the grands
      const isLast = i === this.data.match.length - 1;
      if (isLast && lastWinner === 1) {
        continue;
      }
      // BYE
      if (match.opponent1 === null || match.opponent2 === null) {
        continue;
      }
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        return false;
      }

      lastWinner = match.opponent1?.result === "win" ? 1 : 2;
    }

    return true;
  }

  source(placements: number[]) {
    const resolveLosersGroupId = (data: ValueToArray<DataTypes>) => {
      const minGroupId = Math.min(...data.round.map((round) => round.group_id));

      return minGroupId + 1;
    };
    const placementsToRoundsIds = (
      data: ValueToArray<DataTypes>,
      losersGroupId: number,
    ) => {
      const firstRoundIsOnlyByes = () => {
        const losersMatches = data.match.filter(
          (match) => match.group_id === losersGroupId,
        );

        const fistRoundId = Math.min(...losersMatches.map((m) => m.round_id));

        const firstRoundMatches = losersMatches.filter(
          (match) => match.round_id === fistRoundId,
        );

        return firstRoundMatches.every(
          (match) => match.opponent1 === null || match.opponent2 === null,
        );
      };

      const losersRounds = data.round.filter(
        (round) => round.group_id === losersGroupId,
      );
      const orderedRoundsIds = losersRounds
        .map((round) => round.id)
        .sort((a, b) => a - b);
      const amountOfRounds =
        Math.abs(Math.min(...placements)) + (firstRoundIsOnlyByes() ? 1 : 0);

      return orderedRoundsIds.slice(0, amountOfRounds);
    };

    invariant(
      placements.every((placement) => placement < 0),
      "Positive placements in DE not implemented",
    );

    const losersGroupId = resolveLosersGroupId(this.data);
    const sourceRoundsIds = placementsToRoundsIds(
      this.data,
      losersGroupId,
    ).sort(
      // teams who made it further in the bracket get higher seed
      (a, b) => b - a,
    );

    const teams: { id: number }[] = [];
    let relevantMatchesFinished = true;
    for (const roundId of sourceRoundsIds) {
      const roundsMatches = this.data.match.filter(
        (match) => match.round_id === roundId,
      );

      for (const match of roundsMatches) {
        // BYE
        if (!match.opponent1 || !match.opponent2) {
          continue;
        }
        if (
          match.opponent1?.result !== "win" &&
          match.opponent2?.result !== "win"
        ) {
          relevantMatchesFinished = false;
          continue;
        }

        const loser =
          match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
        invariant(loser?.id, "Loser id not found");

        teams.push({ id: loser.id });
      }
    }

    return {
      relevantMatchesFinished,
      teams: this.teamsWithNames(teams),
    };
  }
}

class RoundRobinBracket extends Bracket {
  constructor(args: CreateBracketArgs) {
    super(args);
  }

  get collectResultsWithPoints() {
    return true;
  }

  source(placements: number[]): {
    relevantMatchesFinished: boolean;
    teams: { id: number; name: string }[];
  } {
    if (placements.some((p) => p < 0)) {
      throw new Error("Negative placements not implemented");
    }
    const standings = this.standings;
    const relevantMatchesFinished =
      standings.length === this.data.participant.length;

    const uniquePlacements = removeDuplicates(
      standings.map((s) => s.placement),
    );

    // 1,3,5 -> 1,2,3 e.g.
    const placementNormalized = (p: number) => {
      return uniquePlacements.indexOf(p) + 1;
    };

    return {
      relevantMatchesFinished,
      teams: standings
        .filter((s) => placements.includes(placementNormalized(s.placement)))
        .map((s) => ({ id: s.team.id, name: s.team.name })),
    };
  }

  get standings(): Standing[] {
    return this.currentStandings();
  }

  currentStandings(includeUnfinishedGroups = false) {
    const groupIds = this.data.group.map((group) => group.id);

    const placements: (Standing & { groupId: number })[] = [];
    for (const groupId of groupIds) {
      const matches = this.data.match.filter(
        (match) => match.group_id === groupId,
      );

      const groupIsFinished = matches.every(
        (match) =>
          // BYE
          match.opponent1 === null ||
          match.opponent2 === null ||
          // match was played out
          match.opponent1?.result === "win" ||
          match.opponent2?.result === "win",
      );

      if (!groupIsFinished && !includeUnfinishedGroups) continue;

      const teams: {
        id: number;
        setWins: number;
        setLosses: number;
        mapWins: number;
        mapLosses: number;
        winsAgainstTied: number;
        points: number;
      }[] = [];

      const updateTeam = ({
        teamId,
        setWins,
        setLosses,
        mapWins,
        mapLosses,
        points,
      }: {
        teamId: number;
        setWins: number;
        setLosses: number;
        mapWins: number;
        mapLosses: number;
        points: number;
      }) => {
        const team = teams.find((team) => team.id === teamId);
        if (team) {
          team.setWins += setWins;
          team.setLosses += setLosses;
          team.mapWins += mapWins;
          team.mapLosses += mapLosses;
          team.points += points;
        } else {
          teams.push({
            id: teamId,
            setWins,
            setLosses,
            mapWins,
            mapLosses,
            winsAgainstTied: 0,
            points,
          });
        }
      };

      for (const match of matches) {
        if (
          match.opponent1?.result !== "win" &&
          match.opponent2?.result !== "win"
        ) {
          continue;
        }

        const winner =
          match.opponent1?.result === "win" ? match.opponent1 : match.opponent2;

        const loser =
          match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;

        if (!winner || !loser) continue;

        invariant(
          typeof winner.id === "number" &&
            typeof loser.id === "number" &&
            typeof winner.score === "number" &&
            typeof loser.score === "number",
          "RoundRobinBracket.standings: winner or loser id not found",
        );

        if (
          typeof winner.totalPoints !== "number" ||
          typeof loser.totalPoints !== "number"
        ) {
          logger.warn(
            "RoundRobinBracket.standings: winner or loser points not found",
          );
        }

        updateTeam({
          teamId: winner.id,
          setWins: 1,
          setLosses: 0,
          mapWins: winner.score,
          mapLosses: loser.score,
          points: winner.totalPoints ?? 0,
        });
        updateTeam({
          teamId: loser.id,
          setWins: 0,
          setLosses: 1,
          mapWins: loser.score,
          mapLosses: winner.score,
          points: loser.totalPoints ?? 0,
        });
      }

      for (const team of teams) {
        for (const team2 of teams) {
          if (team.id === team2.id) continue;
          if (team.setWins !== team2.setWins) continue;

          // they are different teams and are tied, let's check who won

          const wonTheirMatch = matches.some(
            (match) =>
              (match.opponent1?.id === team.id &&
                match.opponent2?.id === team2.id &&
                match.opponent1?.result === "win") ||
              (match.opponent1?.id === team2.id &&
                match.opponent2?.id === team.id &&
                match.opponent2?.result === "win"),
          );

          if (wonTheirMatch) {
            team.winsAgainstTied++;
          }
        }
      }

      placements.push(
        ...teams
          .sort((a, b) => {
            if (a.setWins > b.setWins) return -1;
            if (a.setWins < b.setWins) return 1;

            if (a.winsAgainstTied > b.winsAgainstTied) return -1;
            if (a.winsAgainstTied < b.winsAgainstTied) return 1;

            if (a.mapWins > b.mapWins) return -1;
            if (a.mapWins < b.mapWins) return 1;

            if (a.points > b.points) return -1;
            if (a.points < b.points) return 1;

            const aSeed = Number(this.tournament.teamById(a.id)?.seed);
            const bSeed = Number(this.tournament.teamById(b.id)?.seed);

            if (aSeed < bSeed) return -1;
            if (aSeed > bSeed) return 1;

            return 0;
          })
          .map((team, i) => {
            return {
              team: this.tournament.teamById(team.id)!,
              placement: i + 1,
              groupId,
              stats: {
                setWins: team.setWins,
                setLosses: team.setLosses,
                mapWins: team.mapWins,
                mapLosses: team.mapLosses,
                points: team.points,
                winsAgainstTied: team.winsAgainstTied,
              },
            };
          }),
      );
    }

    const sorted = placements.sort((a, b) => {
      if (a.placement < b.placement) return -1;
      if (a.placement > b.placement) return 1;

      if (a.groupId < b.groupId) return -1;
      if (a.groupId > b.groupId) return 1;

      return 0;
    });

    let lastPlacement = 0;
    let currentPlacement = 1;
    let teamsEncountered = 0;
    return this.standingsWithoutNonParticipants(
      sorted.map((team) => {
        if (team.placement !== lastPlacement) {
          lastPlacement = team.placement;
          currentPlacement = teamsEncountered + 1;
        }
        teamsEncountered++;
        return {
          ...team,
          placement: currentPlacement,
          stats: team.stats,
        };
      }),
    );
  }

  get type(): TournamentBracketProgression[number]["type"] {
    return "round_robin";
  }
}
