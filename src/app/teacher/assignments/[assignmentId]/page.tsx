import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getTeacherAssignmentDetails } from "@/lib/actions/assignment-actions";
import { TeacherAssignmentDetailsClient } from "./teacher-assignment-details-client";

interface PageProps {
  params: Promise<{
    assignmentId: string;
  }>;
}

export default async function TeacherAssignmentDetailsPage({ params }: PageProps) {
  const { assignmentId } = await params;
  const user = await getCurrentAppUser();

  if (env.isClerkConfigured && env.isDatabaseConfigured) {
    if (!user) {
      redirect("/sign-in");
    }
    if (!user.role) {
      redirect("/onboarding");
    }
    if (user.role !== Role.TEACHER) {
      redirect("/unauthorized");
    }
  }

  const activeUser = user || {
    id: "demo-teacher-id",
    clerkId: "demo-clerk-id",
    email: "teacher@example.com",
    name: "Teacher",
    imageUrl: null,
    role: Role.TEACHER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assignment = await getTeacherAssignmentDetails(assignmentId);

  if (!assignment) {
    notFound();
  }

  return (
    <DashboardShell user={activeUser} title={assignment.title}>
      <TeacherAssignmentDetailsClient assignment={assignment} />
    </DashboardShell>
  );
}
