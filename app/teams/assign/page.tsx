import { unstable_rethrow } from "next/navigation";

import { AssignForm } from "./assign-form";

import { PageErrorState } from "@/components/page-error-state";
import { getTeamsAction } from "../actions";
import { getMembersAction } from "@/app/members/actions";
import { getErrorMessage } from "@/lib/errors";

async function getAssignPageData() {
  try {
    const [teams, members] = await Promise.all([getTeamsAction(), getMembersAction()]);

    return {
      teams,
      members,
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      teams: null,
      members: null,
      errorMessage: getErrorMessage(error, "Failed to load assignment form. Please try again."),
    };
  }
}

export default async function AssignPage() {
  const { teams, members, errorMessage } = await getAssignPageData();

  if (errorMessage || !teams || !members) {
    return (
      <PageErrorState
        title="Unable to load assignment form"
        message={errorMessage ?? "Failed to load assignment form. Please try again."}
        backHref="/teams"
        backLabel="Back to Assignments"
      />
    );
  }

  return <AssignForm teams={teams} members={members} />;
}
