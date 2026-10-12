import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getTeacherClassDetails } from "@/lib/actions/class-actions";
import { TeacherClassDetailsClient } from "./teacher-class-details-client";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function TeacherClassDetailsPage({ params }: PageProps) {
  const { classId } = await params;
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

  const classData = await getTeacherClassDetails(classId);
  if (!classData) {
    notFound();
  }

  return (
    <DashboardShell user={activeUser} title={`Classroom: ${classData.name}`}>
      <TeacherClassDetailsClient classData={classData} />
    </DashboardShell>
  );
}
