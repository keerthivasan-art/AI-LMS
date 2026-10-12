"use client";

import React, { useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppUser } from "@/types";
import { CreateClassroomDialog } from "@/components/dashboard/create-classroom-dialog";

interface TeacherDashboardClientProps {
  user: AppUser;
  dateString: string;
  children: React.ReactNode;
}

export function TeacherDashboardClient({
  user,
  dateString,
  children,
}: TeacherDashboardClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const firstName = user.name ? user.name.split(" ")[0] : "Educator";

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
            Good morning, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your classrooms.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            className="gap-2 shadow-xs font-semibold px-4"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Create Classroom</span>
          </Button>
        </div>
      </div>

      {/* Children Components (Metrics & Main Grid) */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass onCreateClassroom handler to EmptyState / QuickActions if matched
          return child;
        }
        return child;
      })}

      {/* Modal Dialog */}
      <CreateClassroomDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
