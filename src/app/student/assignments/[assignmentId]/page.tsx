import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStudentAssignmentDetails } from "@/lib/actions/assignment-actions";
import { StudentAssignmentDetailsClient } from "./student-assignment-details-client";

interface PageProps {
  params: Promise<{
    assignmentId: string;
  }>;
}

export default async function StudentAssignmentDetailsPage({ params }: PageProps) {
  const { assignmentId } = await params;
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

  const assignment = await getStudentAssignmentDetails(assignmentId);

  if (!assignment) {
    notFound();
  }

  return (
    <DashboardShell user={activeUser} title={assignment.title}>
      <StudentAssignmentDetailsClient assignment={assignment} />
    </DashboardShell>
  );
}
