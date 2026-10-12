import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  LineChart,
  Trophy,
  Code,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStudentClasses } from "@/lib/actions/class-actions";
import { getStudentAssignments } from "@/lib/actions/assignment-actions";
import { getStudentQuizzes } from "@/lib/actions/quiz-actions";
import { getStudentHackathons } from "@/lib/actions/hackathon-actions";
import { getUpcomingCodingContests } from "@/lib/actions/contest-actions";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AiTutorCard } from "@/components/dashboard/ai-tutor-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpcomingPanel } from "@/components/dashboard/upcoming-panel";
import { ActivityList } from "@/components/dashboard/activity-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentDashboardClient } from "./student-dashboard-client";

export default async function StudentDashboardPage() {
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

  const [studentClasses, studentAssignments, studentQuizzes, studentHackathons, upcomingContests] =
    await Promise.all([
      user?.role === Role.STUDENT ? getStudentClasses() : [],
      user?.role === Role.STUDENT ? getStudentAssignments() : [],
      user?.role === Role.STUDENT ? getStudentQuizzes() : [],
      getStudentHackathons(),
      getUpcomingCodingContests(),
    ]);

  const availableQuizzes = studentQuizzes.filter((q) => q.status === "AVAILABLE");
  const completedQuizzes = studentQuizzes.filter((q) => q.status === "COMPLETED");
  const latestCompletedQuiz = completedQuizzes[0] || null;
  const latestScoreStr = latestCompletedQuiz?.attempt 
    ? `${latestCompletedQuiz.attempt.score} / ${latestCompletedQuiz.attempt.totalMarks} (${Math.round((latestCompletedQuiz.attempt.score / latestCompletedQuiz.attempt.totalMarks) * 100)}%)`
    : "No quiz score yet";

  const pendingAssignments = studentAssignments.filter(
    (a) => a.status === "NOT SUBMITTED" || a.status === "OVERDUE"
  );

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell user={activeUser} title="Student Overview">
      <StudentDashboardClient user={activeUser} dateString={currentDateStr}>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="My Classes"
            value={studentClasses.length}
            subtitle={studentClasses.length > 0 ? `${studentClasses.length} enrolled class${studentClasses.length > 1 ? "es" : ""}` : "No enrolled classes"}
            icon={BookOpen}
          />
          <MetricCard
            title="Pending Assignments"
            value={pendingAssignments.length}
            subtitle={pendingAssignments.length > 0 ? `${pendingAssignments.length} assignment${pendingAssignments.length > 1 ? "s" : ""} pending` : "All assignments submitted"}
            icon={Clock}
          />
          <MetricCard
            title="Available Quizzes"
            value={availableQuizzes.length}
            subtitle={completedQuizzes.length > 0 ? `${completedQuizzes.length} completed quiz${completedQuizzes.length > 1 ? "zes" : ""}` : "No quizzes completed"}
            icon={CheckCircle2}
          />
          <MetricCard
            title="Latest Quiz Score"
            value={latestCompletedQuiz ? `${Math.round((latestCompletedQuiz.attempt!.score / latestCompletedQuiz.attempt!.totalMarks) * 100)}%` : "0%"}
            subtitle={latestScoreStr}
            icon={LineChart}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Classes */}
            <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4" id="classes">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">My Enrolled Classes</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your active coursework and study resources.
                  </p>
                </div>
                {studentClasses.length > 0 && (
                  <Button variant="ghost" size="sm" asChild className="text-xs font-semibold gap-1 text-primary">
                    <Link href="/student/classes">
                      <span>View All</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>

              {studentClasses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No enrolled classrooms yet"
                  description="Join a classroom using an invite code from your instructor to get started."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentClasses.slice(0, 4).map((cls) => (
                    <Card key={cls.id} className="border bg-card/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        </div>
                        <CardTitle className="text-base font-bold tracking-tight mt-1 line-clamp-1">
                          {cls.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-1">
                          Instructor: {cls.teacher.name || cls.teacher.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span className="flex items-center gap-1 font-medium">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            {cls._count.members} Classmate{cls._count.members !== 1 ? "s" : ""}
                          </span>
                          <Button size="sm" variant="ghost" asChild className="h-7 text-xs font-semibold gap-1 px-2">
                            <Link href={`/student/classes/${cls.id}`}>
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

            {/* AI Tutor Card */}
            <AiTutorCard />

            {/* Opportunities Grid with Real Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border bg-card/80 shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Hackathons
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {studentHackathons.length} Active
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {studentHackathons.length > 0
                      ? `${studentHackathons[0]?.title}`
                      : "Project-building competitions curated by your teachers"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-amber-500/30 hover:bg-amber-500/10">
                    <Link href="/student/hackathons">
                      <span>Browse All Hackathons</span>
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
                      {upcomingContests.length} Scheduled
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {upcomingContests.length > 0
                      ? `${upcomingContests[0]?.name}`
                      : "Rated challenges on Codeforces, LeetCode, CodeChef"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-blue-500/30 hover:bg-blue-500/10">
                    <Link href="/student/contests">
                      <span>View Contests Schedule</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingPanel title="Upcoming Deadlines" description="Assignments & quiz schedules" />
            <QuickActions role="STUDENT" />
            <ActivityList />
          </div>
        </div>
      </StudentDashboardClient>
    </DashboardShell>
  );
}

