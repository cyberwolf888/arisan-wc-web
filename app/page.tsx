import { unstable_rethrow } from "next/navigation";

import type { EnrichedTeam } from "@/components/group-standings-table";
import { HomeSearchWrapper } from "@/components/home-search-wrapper";
import { PageErrorState } from "@/components/page-error-state";
import { R32MatchesSection, type R32Game } from "@/components/r32-matches-section";
import { getErrorMessage } from "@/lib/errors";
import { fetchGames } from "@/lib/games-api";
import { fetchGroupStandings } from "@/lib/groups-api";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

type TeamRow = Pick<Tables<"teams">, "_id" | "id" | "groups" | "name_en" | "flag">;
type MemberRow = Pick<Tables<"members">, "_id" | "name">;
type AssignmentRow = Pick<Tables<"member_teams">, "member_id" | "team_id">;

const BASE_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const UNGROUPED = "UNGROUPED";

function normalizeGroup(value: string | null) {
  const normalized = value?.trim().toUpperCase();
  return normalized || UNGROUPED;
}

async function getHomeData() {
  const supabase = await createClient();

  // Fetch Supabase data + external APIs in parallel
  const [teamsResult, membersResult, assignmentsResult, groupStatsMap, allGames] = await Promise.all([
    supabase.from("teams").select("_id,id,groups,name_en,flag"),
    supabase.from("members").select("_id,name"),
    supabase.from("member_teams").select("member_id,team_id"),
    fetchGroupStandings(),
    fetchGames(),
  ]);

  if (teamsResult.error) {
    throw new Error(`Failed to fetch teams: ${teamsResult.error.message}`);
  }

  if (membersResult.error) {
    throw new Error(`Failed to fetch members: ${membersResult.error.message}`);
  }

  if (assignmentsResult.error) {
    throw new Error(`Failed to fetch assignments: ${assignmentsResult.error.message}`);
  }

  const teams = (teamsResult.data ?? []) as TeamRow[];
  const members = (membersResult.data ?? []) as MemberRow[];
  const assignments = (assignmentsResult.data ?? []) as AssignmentRow[];

  // ── Member name lookups ──────────────────────────────────────────────────
  const memberNameById = new Map(
    members.map((member) => [member._id, member.name?.trim() || "Unnamed member"]),
  );

  const membersByTeamId = new Map<string, string[]>();

  for (const assignment of assignments) {
    if (!assignment.team_id) continue;

    const memberName = memberNameById.get(assignment.member_id);
    if (!memberName) continue;

    const assignedMembers = membersByTeamId.get(assignment.team_id) ?? [];
    if (!assignedMembers.includes(memberName)) {
      assignedMembers.push(memberName);
      membersByTeamId.set(assignment.team_id, assignedMembers);
    }
  }

  // ── Build team lookup by numeric id ─────────────────────────────────────
  const teamByNumericId = new Map<number, TeamRow>();
  const teamsByGroup = new Map<string, TeamRow[]>();

  for (const team of teams) {
    if (team.id !== null) {
      teamByNumericId.set(team.id, team);
    }
    const group = normalizeGroup(team.groups);
    const groupedTeams = teamsByGroup.get(group) ?? [];
    groupedTeams.push(team);
    teamsByGroup.set(group, groupedTeams);
  }

  // ── Build R32 enriched games ─────────────────────────────────────────────
  const R32_TYPES = new Set(["r32", "round_of_32"]);

  const r32Games: R32Game[] = allGames
    .filter((g) => R32_TYPES.has(g.type?.toLowerCase() ?? ""))
    .map((g) => {
      const homeNumericId = parseInt(g.home_team_id, 10);
      const awayNumericId = parseInt(g.away_team_id, 10);

      const homeTeam = isNaN(homeNumericId) ? undefined : teamByNumericId.get(homeNumericId);
      const awayTeam = isNaN(awayNumericId) ? undefined : teamByNumericId.get(awayNumericId);

      const homeMemberNames = homeTeam ? (membersByTeamId.get(homeTeam._id) ?? []) : [];
      const awayMemberNames = awayTeam ? (membersByTeamId.get(awayTeam._id) ?? []) : [];

      return {
        ...g,
        homeFlagUrl: homeTeam?.flag ?? null,
        awayFlagUrl: awayTeam?.flag ?? null,
        homeMemberName: homeMemberNames.length > 0 ? homeMemberNames.join(", ") : null,
        awayMemberName: awayMemberNames.length > 0 ? awayMemberNames.join(", ") : null,
      };
    });

  // ── Determine ordered group keys ─────────────────────────────────────────
  const extraGroups = Array.from(teamsByGroup.keys())
    .filter((group) => !BASE_GROUPS.includes(group) && group !== UNGROUPED)
    .sort();

  // Include UNGROUPED last if it has teams
  const ungroupedTeams = teamsByGroup.get(UNGROUPED) ?? [];
  const orderedGroups = [
    ...BASE_GROUPS,
    ...extraGroups,
    ...(ungroupedTeams.length > 0 ? [UNGROUPED] : []),
  ];

  // ── Build enriched teams per group ───────────────────────────────────────
  const enrichedByGroup = new Map<string, EnrichedTeam[]>();

  for (const group of orderedGroups) {
    const localTeams = teamsByGroup.get(group) ?? [];
    const apiStats = groupStatsMap.get(group) ?? [];

    // Build a map of numericId → API stats for quick lookup
    const statsByNumericId = new Map(
      apiStats.map((s) => [parseInt(s.team_id, 10), s]),
    );

    // Enrich each local team with API stats
    const enriched: EnrichedTeam[] = localTeams.map((team) => {
      const stats = team.id !== null ? statsByNumericId.get(team.id) : undefined;
      return {
        teamId: team._id,
        numericId: team.id,
        nameEn: team.name_en?.trim() || "Unknown team",
        flag: team.flag,
        members: membersByTeamId.get(team._id) ?? [],
        mp: stats ? parseInt(stats.mp, 10) : 0,
        w: stats ? parseInt(stats.w, 10) : 0,
        d: stats ? parseInt(stats.d, 10) : 0,
        l: stats ? parseInt(stats.l, 10) : 0,
        pts: stats ? parseInt(stats.pts, 10) : 0,
      };
    });

    // Sort by pts descending; ties broken by team numeric id ascending
    enriched.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (a.numericId !== null && b.numericId !== null) return a.numericId - b.numericId;
      return a.nameEn.localeCompare(b.nameEn);
    });

    enrichedByGroup.set(group, enriched);
  }

  return {
    orderedGroups,
    enrichedByGroup,
    totalTeams: teams.length,
    totalAssignments: assignments.length,
    r32Games,
  };
}

async function getHomePageData() {
  try {
    return {
      data: await getHomeData(),
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);
    return {
      data: null,
      errorMessage: getErrorMessage(error, "Failed to load home page. Please try again."),
    };
  }
}

export default async function HomePage() {
  const result = await getHomePageData();

  if (!result.data) {
    return (
      <PageErrorState
        title="Unable to load team representatives"
        message={result.errorMessage ?? "Failed to load home page. Please try again."}
      />
    );
  }

  const { orderedGroups, enrichedByGroup, totalTeams, totalAssignments, r32Games } = result.data;

  return (
    <section className="w-full space-y-6">
      {/* R32 Matches — above search bar */}
      <R32MatchesSection games={r32Games} />

      <HomeSearchWrapper
        orderedGroups={orderedGroups}
        enrichedByGroup={Object.fromEntries(enrichedByGroup)}
      />
    </section>
  );
}
