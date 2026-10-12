import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentAppUser } from "@/lib/auth";
import { getTeacherHackathons } from "@/lib/actions/hackathon-actions";
import { TeacherHackathonsClient } from "./teacher-hackathons-client";

export const dynamic = "force-dynamic";

export default async function TeacherHackathonsPage() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    redirect("/dashboard");
  }

  const hackathons = await getTeacherHackathons();

  return <TeacherHackathonsClient initialHackathons={hackathons} user={user} />;
}
