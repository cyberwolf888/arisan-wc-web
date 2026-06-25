import { unstable_rethrow } from "next/navigation";

import { AssignmentsTableClient } from "./assignments-table-client";

import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
import { fetchGames } from "@/lib/games-api";
import { getGroupedAssignments } from "@/lib/assignments";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

type TeamRow = Pick<Tables<"teams">, "_id" | "id">;

async function getTeamsPageData() {
  try {
    const supabase = await createClient();
    const [groups, teamsResult, allGames] = await Promise.all([
      getGroupedAssignments(),
      supabase.from("teams").select("_id,id"),
      fetchGames(),
    ]);

    if (teamsResult.error) {
      throw new Error(`Failed to fetch teams: ${teamsResult.error.message}`);
    }

    const teams = (teamsResult.data ?? []) as TeamRow[];

    // Build set of team numeric IDs that appear in R32 games
    const r32NumericIds = new Set<number>();
    for (const game of allGames) {
      const type = game.type?.toLowerCase() ?? "";
      if (type !== "r32" && type !== "round_of_32") continue;
      const homeId = parseInt(game.home_team_id, 10);
      const awayId = parseInt(game.away_team_id, 10);
      if (!isNaN(homeId)) r32NumericIds.add(homeId);
      if (!isNaN(awayId)) r32NumericIds.add(awayId);
    }

    // Map numeric team IDs to UUID _id values
    const r32TeamIds: string[] = [];
    for (const team of teams) {
      if (team.id !== null && r32NumericIds.has(team.id)) {
        r32TeamIds.push(team._id);
      }
    }

    return {
      groups,
      r32TeamIds,
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      groups: null,
      r32TeamIds: [],
      errorMessage: getErrorMessage(error, "Failed to load assignments. Please try again."),
    };
  }
}

export default async function TeamsPage() {
  const { groups, r32TeamIds, errorMessage } = await getTeamsPageData();

  if (errorMessage || !groups) {
    return (
      <PageErrorState
        title="Unable to load assignments"
        message={errorMessage ?? "Failed to load assignments. Please try again."}
      />
    );
  }

  return <AssignmentsTableClient initialGroups={groups} r32TeamIds={r32TeamIds} />;
}
