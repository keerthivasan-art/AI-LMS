import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getTeacherClasses } from "@/lib/actions/class-actions";
import { TeacherClassesClient } from "./teacher-classes-client";

export default async function TeacherClassesPage() {
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

  const classes = await getTeacherClasses();

  return (
    <DashboardShell user={activeUser} title="My Classrooms">
      <TeacherClassesClient classes={classes} />
    </DashboardShell>
  );
}
