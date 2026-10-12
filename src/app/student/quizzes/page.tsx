import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStudentQuizzes } from "@/lib/actions/quiz-actions";
import { StudentQuizzesClient } from "./student-quizzes-client";

export default async function StudentQuizzesPage() {
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

  const quizzes = await getStudentQuizzes();

  return (
    <DashboardShell user={activeUser} title="My Quizzes & Tests">
      <StudentQuizzesClient quizzes={quizzes} />
    </DashboardShell>
  );
}
