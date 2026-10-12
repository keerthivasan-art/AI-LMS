import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStudentQuizDetails } from "@/lib/actions/quiz-actions";
import { StudentQuizDetailsClient } from "./student-quiz-details-client";

interface PageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function StudentQuizDetailsPage({ params }: PageProps) {
  const { quizId } = await params;
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

  const quiz = await getStudentQuizDetails(quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <DashboardShell user={activeUser} title={quiz.title}>
      <StudentQuizDetailsClient quiz={quiz} />
    </DashboardShell>
  );
}
