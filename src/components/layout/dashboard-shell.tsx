"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { AppUser } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  user: AppUser | null;
  title?: string;
  children: React.ReactNode;
}

export function DashboardShell({ user, title, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <DashboardSidebar
        role={user?.role || null}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        className="hidden md:flex shrink-0 fixed inset-y-0 left-0 z-40"
      />

      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300",
          collapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <DashboardHeader user={user} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
