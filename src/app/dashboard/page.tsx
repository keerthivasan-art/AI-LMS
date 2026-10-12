import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncUserWithDb } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardRootPage() {
  if (!env.isClerkConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-md text-center border-amber-500/30">
          <CardHeader>
            <CardTitle>Clerk Authentication Required</CardTitle>
            <CardDescription>
              To access protected dashboard routes, add your Clerk credentials to <code>.env.local</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Sign-in and user synchronization require valid Clerk keys.
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = await syncUserWithDb();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.role) {
    redirect("/onboarding");
  }

  if (user.role === Role.TEACHER) {
    redirect("/teacher/dashboard");
  }

  if (user.role === Role.STUDENT) {
    redirect("/student/dashboard");
  }

  redirect("/onboarding");
}
