import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getTeacherQuizDetails } from "@/lib/actions/quiz-actions";
import { TeacherQuizDetailsClient } from "./teacher-quiz-details-client";

interface PageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function TeacherQuizDetailsPage({ params }: PageProps) {
  const { quizId } = await params;
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

  const quiz = await getTeacherQuizDetails(quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <DashboardShell user={activeUser} title={quiz.title}>
      <TeacherQuizDetailsClient quiz={quiz} />
    </DashboardShell>
  );
}
