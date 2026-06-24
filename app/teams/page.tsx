import { unstable_rethrow } from "next/navigation";

import { AssignmentsTableClient } from "./assignments-table-client";

import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
import { getGroupedAssignments } from "@/lib/assignments";

async function getTeamsPageData() {
  try {
    return {
      groups: await getGroupedAssignments(),
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      groups: null,
      errorMessage: getErrorMessage(error, "Failed to load assignments. Please try again."),
    };
  }
}

export default async function TeamsPage() {
  const { groups, errorMessage } = await getTeamsPageData();

  if (errorMessage || !groups) {
    return (
      <PageErrorState
        title="Unable to load assignments"
        message={errorMessage ?? "Failed to load assignments. Please try again."}
      />
    );
  }

  return <AssignmentsTableClient initialGroups={groups} />;
}
