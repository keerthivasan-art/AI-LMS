"use client";

import React, { useState } from "react";
import { KeyRound, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppUser } from "@/types";
import { JoinClassroomDialog } from "@/components/dashboard/join-classroom-dialog";

interface StudentDashboardClientProps {
  user: AppUser;
  dateString: string;
  children: React.ReactNode;
}

export function StudentDashboardClient({
  user,
  dateString,
  children,
}: StudentDashboardClientProps) {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const firstName = user.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span>{dateString}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {firstName} 🎓
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Continue your learning journey and explore active courses.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            className="gap-2 shadow-xs font-semibold px-4"
            onClick={() => setJoinDialogOpen(true)}
          >
            <KeyRound className="h-4 w-4" />
            <span>Join Classroom</span>
          </Button>
        </div>
      </div>

      {children}

      <JoinClassroomDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
      />
    </div>
  );
}
