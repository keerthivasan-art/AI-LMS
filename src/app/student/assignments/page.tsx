import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStudentAssignments } from "@/lib/actions/assignment-actions";
import { StudentAssignmentsClient } from "./student-assignments-client";

export default async function StudentAssignmentsPage() {
  const user = await getCurrentAppUser();

  if (env.isClerkConfigured && env.isDatabaseConfigured) {
    if (!user) {
      redirect("/sign-in");
    }
    if (!user.role) {
      redirect("/onboarding");
    }
    if (user.role !== Role.STUDENT) {
      redirect("/unauthorized");
    }
  }

  const activeUser = user || {
    id: "demo-student-id",
    clerkId: "demo-clerk-id",
    email: "student@example.com",
    name: "Student",
    imageUrl: null,
    role: Role.STUDENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assignments = await getStudentAssignments();

  return (
    <DashboardShell user={activeUser} title="My Assignments">
      <StudentAssignmentsClient assignments={assignments} />
    </DashboardShell>
  );
}
