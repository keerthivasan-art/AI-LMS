import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Brain,
  BarChart3,
  Trophy,
  Code,
  Bell,
  CheckCircle2,
  ArrowRight,
  Send,
  Users,
  Check,
} from "lucide-react";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Brain className="h-5 w-5" />
            </div>
            <span>AI-LMS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#roles" className="hover:text-foreground transition-colors">
              Roles
            </a>
            <a href="#tutor-preview" className="hover:text-foreground transition-colors">
              AI Tutor
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5 shadow-xs text-xs font-semibold">
              <Link href="/sign-up">
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 sm:px-8 text-center max-w-5xl">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/30 bg-primary/10 text-primary gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation Intelligent Learning Platform</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            AI-Powered Learning Platform for <span className="text-primary">Modern Classrooms</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform digital education with intelligent classrooms, instant automated grading, personalized 24/7 AI tutoring, and seamless opportunity discovery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto h-11 px-8 text-sm font-semibold shadow-md gap-2">
              <Link href="/sign-up">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-11 px-8 text-sm font-semibold">
              <a href="#capabilities">Explore Platform</a>
            </Button>
          </div>
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section id="capabilities" className="py-20 bg-muted/20 border-y">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <Badge variant="secondary" className="mb-1 text-xs">Comprehensive Suite</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Platform Capabilities</h2>
            <p className="text-muted-foreground text-sm">
              Everything required to conduct, manage, and excel in modern digital learning environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Smart Classrooms</CardTitle>
                <CardDescription className="text-xs">
                  Organize courses, stream live materials, and manage students with unique invite codes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Assignments & Quizzes</CardTitle>
                <CardDescription className="text-xs">
                  Create timed quizzes, auto-graded coding tasks, and multi-format homework.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Brain className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">AI Tutor</CardTitle>
                <CardDescription className="text-xs">
                  Personalized 24/7 AI mentor assisting students with hints, explanations, and debugging.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Progress Tracking</CardTitle>
                <CardDescription className="text-xs">
                  In-depth visual analytics for teachers to monitor student performance and mastery.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Hackathons</CardTitle>
                <CardDescription className="text-xs">
                  Discover, participate in, and host project-building hackathons across topics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Code className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Coding Contests</CardTitle>
                <CardDescription className="text-xs">
                  Real-time competitive programming platform with synchronized test cases.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Notifications</CardTitle>
                <CardDescription className="text-xs">
                  Instant reminders for upcoming deadlines, quiz releases, and graded feedback.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-all border-dashed flex flex-col justify-center items-center text-center p-6 bg-muted/40">
              <Sparkles className="h-7 w-7 text-primary mb-2 opacity-80" />
              <CardTitle className="text-sm font-bold">Continuous Innovations</CardTitle>
              <CardDescription className="text-[11px] mt-1">
                More intelligent learning tools rolling out continuously.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <Badge variant="outline" className="mb-1 text-xs">Simplified Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-sm">
              Tailored learning journeys designed specifically for educators and learners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Teacher Workflow */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">For Teachers</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Create Class", desc: "Set up a digital classroom in seconds and generate a shareable code." },
                  { step: "2", title: "Share Code", desc: "Invite students directly via email or class code." },
                  { step: "3", title: "Manage Learning", desc: "Publish assignments, quizzes, and learning modules." },
                  { step: "4", title: "Track Progress", desc: "Review automated grades and AI-driven skill reports." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Workflow */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">For Students</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Join Class", desc: "Enter your teacher's code to unlock instant access to coursework." },
                  { step: "2", title: "Learn & Practice", desc: "Access interactive lessons, notes, and study resources." },
                  { step: "3", title: "Complete Work", desc: "Submit homework and complete timed quizzes directly online." },
                  { step: "4", title: "Use AI Tutor", desc: "Get round-the-clock guidance whenever you get stuck." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-xs">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section id="roles" className="py-20 bg-muted/20 border-y">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <Badge variant="secondary" className="mb-1 text-xs">Role-Based Experience</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tailored Role Experiences</h2>
            <p className="text-muted-foreground text-sm">
              Distinct interfaces engineered specifically for your role in the learning ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teacher Card */}
            <Card className="border shadow-xs relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-bold">Teacher Workspace</CardTitle>
                    <CardDescription className="text-xs">Instructor & Course Administrator</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  "Create and manage digital classrooms",
                  "Design interactive assignments and quizzes",
                  "Automate evaluation and grading workflows",
                  "Track real-time student analytics and mastery",
                  "Share academic opportunities with students",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Student Card */}
            <Card className="border shadow-xs relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-bold">Student Workspace</CardTitle>
                    <CardDescription className="text-xs">Learner & Competitor</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  "Join classrooms with instant invite codes",
                  "Access course materials and lecture notes",
                  "Submit assignments and attempt timed quizzes",
                  "Interact 24/7 with your personal AI Tutor",
                  "Discover coding contests and hackathons",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI TUTOR PREVIEW */}
      <section id="tutor-preview" className="py-20">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <Badge variant="outline" className="mb-1 border-primary/30 text-primary text-xs">Interactive Preview</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Tutor Preview</h2>
            <p className="text-muted-foreground text-sm">
              Experience how the AI Tutor guides students step-by-step through complex concepts.
            </p>
          </div>

          <Card className="border shadow-lg bg-card overflow-hidden">
            <div className="bg-muted/60 p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">AI</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-semibold">AI Tutor Assistant</div>
                  <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Ready
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Visual Demo Only</Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-primary-foreground p-3.5 rounded-2xl rounded-tr-xs text-xs max-w-lg shadow-xs">
                  Can you explain how recursive function call stacks work in Python with a simple example?
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">ST</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted/40 border p-4 rounded-2xl rounded-tl-xs text-xs max-w-xl space-y-3">
                  <p className="leading-relaxed">
                    Great question! Think of a <strong>recursion call stack</strong> like a stack of plates. Every time a function calls itself, a new plate (frame) is pushed onto the stack.
                  </p>
                  <div className="bg-zinc-950 text-zinc-100 p-3 rounded-md font-mono text-xs overflow-x-auto">
                    <div>def factorial(n):</div>
                    <div className="pl-4">if n == 1: return 1 # Base case</div>
                    <div className="pl-4">return n * factorial(n - 1)</div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    💡 <strong>Key Takeaway:</strong> Without a proper base case, the stack keeps growing until Python raises a <code>RecursionError</code>!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-background text-muted-foreground text-xs cursor-not-allowed opacity-80">
                  <span className="flex-1 px-2">Ask the AI Tutor any question...</span>
                  <Button size="icon" className="h-7 w-7" disabled>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-muted/40 mt-auto">
        <div className="container mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-3">
              <Link href="/" className="flex items-center gap-2 font-bold text-base">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Brain className="h-4 w-4" />
                </div>
                <span>AI-LMS</span>
              </Link>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Intelligent Learning Management System empowering teachers with automated tools and students with personalized 24/7 AI tutoring.
              </p>
              <div className="text-[11px] text-muted-foreground pt-2">
                © {new Date().getFullYear()} AI-LMS Platform. All rights reserved.
              </div>
            </div>

            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#capabilities" className="hover:text-foreground">Classrooms</a></li>
                <li><a href="#capabilities" className="hover:text-foreground">AI Tutor</a></li>
                <li><a href="#capabilities" className="hover:text-foreground">Quizzes</a></li>
                <li><a href="#capabilities" className="hover:text-foreground">Analytics</a></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-3">Features</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground">For Teachers</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground">For Students</a></li>
                <li><a href="#capabilities" className="hover:text-foreground">Hackathons</a></li>
                <li><a href="#capabilities" className="hover:text-foreground">Coding Contests</a></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-3">Support</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/sign-in" className="hover:text-foreground">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground">Sign Up</Link></li>
                <li><Link href="/onboarding" className="hover:text-foreground">Onboarding</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
