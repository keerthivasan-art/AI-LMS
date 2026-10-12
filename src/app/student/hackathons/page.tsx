import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentAppUser } from "@/lib/auth";
import { getStudentHackathons } from "@/lib/actions/hackathon-actions";
import { StudentHackathonsClient } from "./student-hackathons-client";

export const dynamic = "force-dynamic";

export default async function StudentHackathonsPage() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    redirect("/dashboard");
  }

  const hackathons = await getStudentHackathons();

  return <StudentHackathonsClient hackathons={hackathons} user={user} />;
}
