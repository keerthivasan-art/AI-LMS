import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, Shield, Calendar, IdCard, Lock, CheckCircle2 } from "lucide-react";
import { getCurrentAppUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const user = await getCurrentAppUser();

  if (env.isClerkConfigured && env.isDatabaseConfigured) {
    if (!user) {
      redirect("/sign-in");
    }
    if (!user.role) {
      redirect("/onboarding");
    }
  }

  const activeUser = user || {
    id: "demo-user-id",
    clerkId: "demo-clerk-id",
    email: "user@example.com",
    name: "User Account",
    imageUrl: null,
    role: "STUDENT" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const initials = activeUser.name
    ? activeUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DashboardShell user={activeUser} title="User Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Overview Header Card */}
        <Card className="border shadow-xs bg-card/80">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-xs">
                <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{activeUser.name || "User Account"}</h2>
                  <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 px-3 py-1 text-xs font-bold uppercase tracking-wider gap-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    {activeUser.role || "Unassigned"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{activeUser.email}</span>
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5" />
                    ID: {activeUser.id.slice(0, 12)}...
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details & Workspace Authorization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border bg-card/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription className="text-xs">Managed via your authentication profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Full Name</label>
                <div className="p-2.5 rounded-lg bg-muted/30 border font-medium text-foreground">
                  {activeUser.name || "Not specified"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Primary Email Address</label>
                <div className="p-2.5 rounded-lg bg-muted/30 border font-medium text-foreground">
                  {activeUser.email}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Workspace Authorization</span>
              </CardTitle>
              <CardDescription className="text-xs">Server-enforced role permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-muted-foreground">Assigned Application Role</label>
                  <Badge variant="outline" className="text-[10px] uppercase border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border font-bold text-primary flex items-center justify-between">
                  <span>{activeUser.role}</span>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs gap-1.5 cursor-pointer">
                  <Link href="/onboarding">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>Change or Switch Role (Teacher / Student)</span>
                  </Link>
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Your assigned role determines accessible routes and permissions across the platform. You can update your workspace role at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
