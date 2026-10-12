import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { AiTutorContainer } from "@/components/ai-tutor/ai-tutor-container";

export default async function TeacherAiTutorPage() {
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
    name: "Instructor",
    imageUrl: null,
    role: Role.TEACHER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <DashboardShell user={activeUser} title="AI Teaching Assistant & Tutor">
      <div className="w-full">
        <AiTutorContainer userRole="TEACHER" userName={activeUser.name || "Instructor"} />
      </div>
    </DashboardShell>
  );
}
