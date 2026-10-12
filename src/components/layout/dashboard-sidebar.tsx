"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  HelpCircle,
  Trophy,
  Code,
  Megaphone,
  User,
  Brain,
  Bell,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  functional?: boolean;
}

const teacherNav: NavItem[] = [
  { title: "Overview", href: "/teacher/dashboard", icon: LayoutDashboard, functional: true },
  { title: "My Classes", href: "/teacher/classes", icon: BookOpen, functional: true },
  { title: "AI Assistant", href: "/teacher/ai-tutor", icon: Brain, functional: true },
  { title: "Assignments", href: "/teacher/assignments", icon: FileCheck, functional: true },
  { title: "Quizzes", href: "/teacher/quizzes", icon: HelpCircle, functional: true },
  { title: "Hackathons", href: "/teacher/hackathons", icon: Trophy, functional: true },
  { title: "Coding Contests", href: "/teacher/contests", icon: Code, functional: true },
  { title: "Announcements", href: "/teacher/notifications", icon: Megaphone, functional: true },
  { title: "Profile", href: "/profile", icon: User, functional: true },
];

const studentNav: NavItem[] = [
  { title: "Overview", href: "/student/dashboard", icon: LayoutDashboard, functional: true },
  { title: "My Classes", href: "/student/classes", icon: BookOpen, functional: true },
  { title: "AI Tutor", href: "/student/ai-tutor", icon: Brain, functional: true },
  { title: "Assignments", href: "/student/assignments", icon: FileCheck, functional: true },
  { title: "Quizzes", href: "/student/quizzes", icon: HelpCircle, functional: true },
  { title: "Hackathons", href: "/student/hackathons", icon: Trophy, functional: true },
  { title: "Coding Contests", href: "/student/contests", icon: Code, functional: true },
  { title: "Notifications", href: "/student/notifications", icon: Bell, functional: true },
  { title: "Profile", href: "/profile", icon: User, functional: true },
];

interface DashboardSidebarProps {
  role: Role | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({
  role,
  collapsed = false,
  onToggleCollapse,
  className,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = role === Role.TEACHER ? teacherNav : studentNav;

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex flex-col h-full bg-[#0F172A] border-r border-slate-800 text-slate-100 transition-all duration-300 select-none",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base leading-none tracking-tight text-white">AI-LMS</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-indigo-500/40 text-indigo-300 bg-indigo-500/10">
                    SaaS
                  </Badge>
                </div>
                <span className="text-[10px] text-slate-400 font-medium capitalize mt-1 truncate">
                  {role ? `${role.toLowerCase()} Portal` : "Workspace"}
                </span>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800 hidden md:flex shrink-0"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Section Label */}
        {!collapsed && (
          <div className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.functional && pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.title}
                href={item.functional ? item.href : "#"}
                onClick={(e) => {
                  if (!item.functional) {
                    e.preventDefault();
                  } else if (onNavigate) {
                    onNavigate();
                  }
                }}
                className={cn(
                  "flex items-center rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 group relative",
                  collapsed ? "justify-center px-2" : "justify-between",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold"
                    : item.functional
                    ? "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                    : "text-slate-500 hover:text-slate-400 cursor-not-allowed opacity-60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </div>

                {!collapsed && !item.functional && (
                  <span className="text-[9px] text-slate-500 font-medium px-1">
                    Disabled
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-semibold bg-slate-900 border-slate-700 text-white">
                    {item.title} {!item.functional && "(Coming Soon)"}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* User Role & Footer Snippet */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-300">Active Workspace</span>
              </div>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-bold uppercase bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                {role || "Guest"}
              </Badge>
            </div>
          ) : (
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 font-bold uppercase bg-indigo-500/20 text-indigo-300">
                {role?.slice(0, 1) || "G"}
              </Badge>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
