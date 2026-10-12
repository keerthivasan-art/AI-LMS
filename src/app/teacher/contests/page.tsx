import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentAppUser } from "@/lib/auth";
import { getUpcomingCodingContests } from "@/lib/actions/contest-actions";
import { TeacherContestsClient } from "./teacher-contests-client";

export const dynamic = "force-dynamic";

export default async function TeacherContestsPage() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    redirect("/dashboard");
  }

  const contests = await getUpcomingCodingContests();

  return <TeacherContestsClient contests={contests} user={user} />;
}
