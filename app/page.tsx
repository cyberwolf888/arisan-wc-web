import { unstable_rethrow } from "next/navigation";

import { TeamCard } from "@/components/team-card";
import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
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

function sortTeams(teamA: TeamRow, teamB: TeamRow) {
  if (teamA.id === null && teamB.id === null) {
    return (teamA.name_en || "").localeCompare(teamB.name_en || "");
  }

  if (teamA.id === null) {
    return 1;
  }

  if (teamB.id === null) {
    return -1;
  }

  return teamA.id - teamB.id;
}

async function getHomeData() {
  const supabase = await createClient();

  const [teamsResult, membersResult, assignmentsResult] = await Promise.all([
    supabase.from("teams").select("_id,id,groups,name_en,flag"),
    supabase.from("members").select("_id,name"),
    supabase.from("member_teams").select("member_id,team_id"),
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

  const memberNameById = new Map(
    members.map((member) => [member._id, member.name?.trim() || "Unnamed member"]),
  );

  const membersByTeamId = new Map<string, string[]>();

  for (const assignment of assignments) {
    if (!assignment.team_id) {
      continue;
    }

    const memberName = memberNameById.get(assignment.member_id);
    if (!memberName) {
      continue;
    }

    const assignedMembers = membersByTeamId.get(assignment.team_id) ?? [];

    if (!assignedMembers.includes(memberName)) {
      assignedMembers.push(memberName);
      membersByTeamId.set(assignment.team_id, assignedMembers);
    }
  }

  const teamsByGroup = new Map<string, TeamRow[]>();

  for (const team of teams) {
    const group = normalizeGroup(team.groups);
    const groupedTeams = teamsByGroup.get(group) ?? [];

    groupedTeams.push(team);
    teamsByGroup.set(group, groupedTeams);
  }

  for (const groupedTeams of teamsByGroup.values()) {
    groupedTeams.sort(sortTeams);
  }

  const extraGroups = Array.from(teamsByGroup.keys())
    .filter((group) => !BASE_GROUPS.includes(group))
    .sort();

  const orderedGroups = [...BASE_GROUPS, ...extraGroups];

  return {
    orderedGroups,
    teamsByGroup,
    membersByTeamId,
    totalTeams: teams.length,
    totalAssignments: assignments.length,
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

  const { orderedGroups, teamsByGroup, membersByTeamId, totalTeams, totalAssignments } = result.data;

  return (
    <section className="w-full space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Arisan Bola PELITA
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Team Representatives</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only list of teams and assigned members. {totalTeams} teams, {totalAssignments} active
          assignments.
        </p>
      </div>

      {orderedGroups.map((group) => {
        const teamsInGroup = teamsByGroup.get(group) ?? [];
        const title = group === UNGROUPED ? "Ungrouped" : `Group ${group}`;

        return (
          <section
            key={group}
            className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {teamsInGroup.length} teams
              </p>
            </div>

            {teamsInGroup.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {teamsInGroup.map((team) => (
                  <TeamCard
                    key={team._id}
                    team={{ name_en: team.name_en, flag: team.flag }}
                    members={membersByTeamId.get(team._id) ?? []}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border/70 bg-muted/25 px-3 py-4 text-sm text-muted-foreground">
                No teams available for this group yet.
              </p>
            )}
          </section>
        );
      })}
    </section>
  );
}
