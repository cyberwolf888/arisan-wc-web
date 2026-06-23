import { MembersTableClient } from "./members-table-client";

import { getMembers } from "@/lib/members";

export default async function MembersPage() {
  const members = await getMembers();

  return <MembersTableClient initialMembers={members} />;
}
