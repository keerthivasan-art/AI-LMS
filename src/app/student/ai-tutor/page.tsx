import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { AiTutorContainer } from "@/components/ai-tutor/ai-tutor-container";

export default async function StudentAiTutorPage() {
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

  return (
    <DashboardShell user={activeUser} title="24/7 AI Tutor">
      <div className="w-full">
        <AiTutorContainer userRole="STUDENT" userName={activeUser.name || "Student"} />
      </div>
    </DashboardShell>
  );
}
