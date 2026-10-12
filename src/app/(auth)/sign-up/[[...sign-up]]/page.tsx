import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Brain, Sparkles, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";

export default function SignUpPage() {
  const isClerkReady = env.isClerkConfigured;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Column: SaaS Branding Panel (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Brain className="h-6 w-6" />
            </div>
            <span>AI-LMS</span>
          </Link>

          <div className="space-y-4 pt-12 max-w-lg">
            <Badge variant="outline" className="border-primary/40 text-primary-foreground bg-primary/20 text-xs px-3 py-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Join AI-LMS Today
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Start your <br />
              <span className="text-primary font-black">AI Learning Journey.</span>
            </h1>
            <p className="text-muted-foreground/80 text-sm leading-relaxed">
              Create your account to unlock personalized AI tutoring, digital classrooms, and coursework tools.
            </p>

            <div className="pt-6 space-y-3">
              {[
                "Instant account creation & role selection",
                "Teacher & Student customized dashboards",
                "Interactive AI Tutor explanations",
                "Clean, distraction-free learning interface",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-400">
          © {new Date().getFullYear()} AI-LMS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Column: Sign Up Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12">
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>

          <Link href="/" className="flex lg:hidden items-center gap-2 font-bold text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <span>AI-LMS</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          {isClerkReady ? (
            <div className="flex justify-center">
              <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" />
            </div>
          ) : (
            <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
                  <UserPlus className="h-6 w-6" />
                </div>
                <CardTitle>Clerk Configuration Required</CardTitle>
                <CardDescription>
                  Sign-up is ready for Clerk authentication, but environment variables are missing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  To enable real user sign-up, add your Clerk credentials to <code className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded">.env.local</code>:
                </p>
                <div className="bg-background/80 p-3 rounded-md font-mono text-xs text-foreground border border-border overflow-x-auto space-y-1">
                  <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</div>
                  <div>CLERK_SECRET_KEY=sk_test_...</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-full max-w-md mx-auto text-center text-xs text-muted-foreground">
          Protected by server-side Clerk authentication
        </div>
      </div>
    </div>
  );
}
