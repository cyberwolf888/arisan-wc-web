import { unstable_rethrow } from "next/navigation";

import { MatchesClient } from "@/components/matches-client";
import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
import { fetchGames, type EnrichedGame } from "@/lib/games-api";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type { EnrichedGame };

type TeamRow = Pick<Tables<"teams">, "id" | "flag" | "name_en">;

async function getMatchesData(): Promise<EnrichedGame[]> {
  const supabase = await createClient();

  const [games, teamsResult] = await Promise.all([
    fetchGames(),
    supabase.from("teams").select("id,flag,name_en"),
  ]);

  if (teamsResult.error) {
    throw new Error(`Failed to fetch teams: ${teamsResult.error.message}`);
  }

  const teams = (teamsResult.data ?? []) as TeamRow[];

  // Build lookup: numeric team id → { flag }
  const teamFlagById = new Map<number, string | null>();
  for (const team of teams) {
    if (team.id !== null) {
      teamFlagById.set(team.id, team.flag ?? null);
    }
  }

  return games.map((game) => ({
    ...game,
    homeFlagUrl: teamFlagById.get(parseInt(game.home_team_id, 10)) ?? null,
    awayFlagUrl: teamFlagById.get(parseInt(game.away_team_id, 10)) ?? null,
  }));
}

async function getMatchesPageData() {
  try {
    return { data: await getMatchesData(), errorMessage: null };
  } catch (error) {
    unstable_rethrow(error);
    return {
      data: null,
      errorMessage: getErrorMessage(error, "Failed to load matches. Please try again."),
    };
  }
}

export default async function MatchesPage() {
  const result = await getMatchesPageData();

  if (!result.data) {
    return (
      <PageErrorState
        title="Unable to load matches"
        message={result.errorMessage ?? "Failed to load matches. Please try again."}
      />
    );
  }

  return <MatchesClient games={result.data} />;
}
