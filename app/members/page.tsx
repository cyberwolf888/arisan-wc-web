import { unstable_rethrow } from "next/navigation";

import { MembersTableClient } from "./members-table-client";

import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
import { getMembers } from "@/lib/members";

async function getMembersPageData() {
  try {
    return {
      members: await getMembers(),
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      members: null,
      errorMessage: getErrorMessage(error, "Failed to load members. Please try again."),
    };
  }
}

export default async function MembersPage() {
  const { members, errorMessage } = await getMembersPageData();

  if (errorMessage || !members) {
    return (
      <PageErrorState
        title="Unable to load members"
        message={errorMessage ?? "Failed to load members. Please try again."}
      />
    );
  }

  return <MembersTableClient initialMembers={members} />;
}
