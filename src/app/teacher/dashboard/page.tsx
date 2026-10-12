import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Clock,
  ArrowRight
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getTeacherClasses } from "@/lib/actions/class-actions";
import { getTeacherAssignments } from "@/lib/actions/assignment-actions";
import { getTeacherQuizzes } from "@/lib/actions/quiz-actions";
import { getTeacherHackathons } from "@/lib/actions/hackathon-actions";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AiTutorCard } from "@/components/dashboard/ai-tutor-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpcomingPanel } from "@/components/dashboard/upcoming-panel";
import { ActivityList } from "@/components/dashboard/activity-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Code } from "lucide-react";
import { TeacherDashboardClient } from "./teacher-dashboard-client";

export default async function TeacherDashboardPage() {
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
    name: "Keerthi",
    imageUrl: null,
    role: Role.TEACHER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [teacherClasses, teacherAssignments, teacherQuizzes, teacherHackathons] = await Promise.all([
    user?.role === Role.TEACHER ? getTeacherClasses() : [],
    user?.role === Role.TEACHER ? getTeacherAssignments() : [],
    user?.role === Role.TEACHER ? getTeacherQuizzes() : [],
    user?.role === Role.TEACHER ? getTeacherHackathons() : [],
  ]);

  const totalStudents = teacherClasses.reduce((acc, c) => acc + c._count.members, 0);
  const activeAssignments = teacherAssignments.filter((a) => a.status !== "CLOSED");
  const publishedQuizzes = teacherQuizzes.filter((q) => q.published);

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell user={activeUser} title="Teacher Overview">
      <TeacherDashboardClient
        user={activeUser}
        dateString={currentDateStr}
      >
        {/* Metric Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Classes"
            value={teacherClasses.length}
            subtitle={teacherClasses.length > 0 ? `${teacherClasses.length} active classroom${teacherClasses.length > 1 ? "s" : ""}` : "No classrooms yet"}
            icon={BookOpen}
          />
          <MetricCard
            title="Enrolled Students"
            value={totalStudents}
            subtitle={totalStudents > 0 ? `${totalStudents} total student${totalStudents > 1 ? "s" : ""}` : "No students enrolled"}
            icon={Users}
          />
          <MetricCard
            title="Course Assignments"
            value={teacherAssignments.length}
            subtitle={activeAssignments.length > 0 ? `${activeAssignments.length} active assignment${activeAssignments.length > 1 ? "s" : ""}` : "No active assignments"}
            icon={FileText}
          />
          <MetricCard
            title="Quizzes Published"
            value={publishedQuizzes.length}
            subtitle={teacherQuizzes.length > 0 ? `${teacherQuizzes.length} total quiz draft/published` : "No quizzes created"}
            icon={Clock}
          />
        </div>

        {/* Main Content Grid: 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Classrooms Section */}
            <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4" id="classes">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Your Classrooms</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage active courses, rosters, and teaching materials.
                  </p>
                </div>
                {teacherClasses.length > 0 && (
                  <Button variant="ghost" size="sm" asChild className="text-xs font-semibold gap-1 text-primary">
                    <Link href="/teacher/classes">
                      <span>View All</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>

              {teacherClasses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No classrooms yet"
                  description="Create your first digital classroom to start teaching and managing students."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherClasses.slice(0, 4).map((cls) => (
                    <Card key={cls.id} className="border bg-card/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {cls.joinCode}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold tracking-tight mt-1 line-clamp-1">
                          {cls.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-1">
                          {cls.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span className="flex items-center gap-1 font-medium">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            {cls._count.members} Student{cls._count.members !== 1 ? "s" : ""}
                          </span>
                          <Button size="sm" variant="ghost" asChild className="h-7 text-xs font-semibold gap-1 px-2">
                            <Link href={`/teacher/classes/${cls.id}`}>
                              <span>Open</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* AI Tutor Assistant Card */}
            <AiTutorCard />

            {/* Opportunities & Competitions Management */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border bg-card/80 shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Hackathon Board
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {teacherHackathons.length} Curated
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {teacherHackathons.length > 0
                      ? `${teacherHackathons.filter((h) => h.published).length} published to students`
                      : "Extract, curate and publish hackathon events for students"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-amber-500/30 hover:bg-amber-500/10">
                    <Link href="/teacher/hackathons">
                      <span>Manage Hackathons</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border bg-card/80 shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      Coding Contests
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      Live Monitor
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Track rated rounds across Codeforces, LeetCode, CodeChef
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-blue-500/30 hover:bg-blue-500/10">
                    <Link href="/teacher/contests">
                      <span>View Live Contests</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panel Column (1 span) */}
          <div className="space-y-6">
            <UpcomingPanel title="Needs Attention" description="Pending reviews & assignment deadlines" />
            <QuickActions role="TEACHER" />
            <ActivityList />
          </div>
        </div>
      </TeacherDashboardClient>
    </DashboardShell>
  );
}

