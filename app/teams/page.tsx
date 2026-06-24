import { unstable_rethrow } from "next/navigation";

import { AssignmentsTableClient } from "./assignments-table-client";

import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
import { getAssignments } from "@/lib/assignments";

async function getTeamsPageData() {
  try {
    return {
      assignments: await getAssignments(),
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      assignments: null,
      errorMessage: getErrorMessage(error, "Failed to load assignments. Please try again."),
    };
  }
}

export default async function TeamsPage() {
  const { assignments, errorMessage } = await getTeamsPageData();

  if (errorMessage || !assignments) {
    return (
      <PageErrorState
        title="Unable to load assignments"
        message={errorMessage ?? "Failed to load assignments. Please try again."}
      />
    );
  }

  return <AssignmentsTableClient initialAssignments={assignments} />;
}
