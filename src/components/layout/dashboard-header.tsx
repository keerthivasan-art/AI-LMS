"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import { UserMenu } from "./user-menu";
import { AppUser } from "@/types";

interface DashboardHeaderProps {
  user: AppUser | null;
  title?: string;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ user, title = "Dashboard" }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <MobileSidebar role={user?.role || null} />
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar Placeholder */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            disabled
            className="pl-9 h-9 text-xs bg-muted/30 border-muted-foreground/20 cursor-not-allowed opacity-80"
          />
        </div>

        <ThemeToggle />

        {/* Notifications Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
          title="Notifications & Activity"
        >
          <Link
            href={
              user?.role === "TEACHER"
                ? "/teacher/notifications"
                : user?.role === "STUDENT"
                ? "/student/notifications"
                : "/dashboard"
            }
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </Link>
        </Button>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
