import { notFound, unstable_rethrow } from "next/navigation";

import { ReassignForm } from "./reassign-form";

import { PageErrorState } from "@/components/page-error-state";
import { getAssignment } from "@/lib/assignments";
import { getErrorMessage } from "@/lib/errors";
import { getTeamsAction } from "../../actions";
import { getMembersAction } from "@/app/members/actions";

type ReassignPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getReassignPageData(id: string) {
  try {
    const [assignment, teams, members] = await Promise.all([
      getAssignment(id),
      getTeamsAction(),
      getMembersAction(),
    ]);

    return {
      assignment,
      teams,
      members,
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      assignment: null,
      teams: null,
      members: null,
      errorMessage: getErrorMessage(error, "Failed to load reassignment form. Please try again."),
    };
  }
}

export default async function ReassignPage({ params }: ReassignPageProps) {
  const { id } = await params;
  const { assignment, teams, members, errorMessage } = await getReassignPageData(id);

  if (errorMessage || !teams || !members) {
    return (
      <PageErrorState
        title="Unable to load reassignment form"
        message={errorMessage ?? "Failed to load reassignment form. Please try again."}
        backHref="/teams"
        backLabel="Back to Assignments"
      />
    );
  }

  if (!assignment) {
    notFound();
  }

  return (
    <ReassignForm
      assignmentId={assignment._id}
      teams={teams}
      members={members}
      initialTeamId={assignment.team_id ?? ""}
      initialMemberId={assignment.member_id}
    />
  );
}
