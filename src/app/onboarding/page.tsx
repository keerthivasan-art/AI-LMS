import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { syncUserWithDb } from "@/lib/auth";
import { env } from "@/lib/env";
import { RoleSelectionForm } from "./role-selection-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!env.isClerkConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-md text-center border-amber-500/30">
          <CardHeader>
            <CardTitle>Clerk Authentication Required</CardTitle>
            <CardDescription>Please configure Clerk API keys to complete onboarding.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const user = await syncUserWithDb();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-3">
          <Badge variant="outline" className="px-3.5 py-1 text-primary border-primary/30 bg-primary/5 gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-LMS Workspace Onboarding</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Choose your role
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            {user.role
              ? `Your account is currently set to ${user.role}. You can switch your role below.`
              : "Select how you will use AI-LMS to personalize your workspace experience."}
          </p>
        </div>

        <RoleSelectionForm initialRole={user.role} />

        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Role selections are server-verified and securely saved to your profile.</span>
        </p>
      </div>
    </div>
  );
}
