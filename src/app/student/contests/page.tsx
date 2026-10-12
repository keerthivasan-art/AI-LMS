import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";
import { getUpcomingCodingContests } from "@/lib/actions/contest-actions";
import { StudentContestsClient } from "./student-contests-client";

export const dynamic = "force-dynamic";

export default async function StudentContestsPage() {
  const user = await getCurrentAppUser();
  if (!user) {
    redirect("/sign-in");
  }

  const contests = await getUpcomingCodingContests();

  return <StudentContestsClient contests={contests} user={user} />;
}
