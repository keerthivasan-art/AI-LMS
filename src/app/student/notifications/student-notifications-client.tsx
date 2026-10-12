"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { AppUser } from "@/types";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  FileCheck,
  HelpCircle,
  Trophy,
  Megaphone,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification-actions";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

interface StudentNotificationsClientProps {
  initialNotifications: NotificationItem[];
  user: AppUser;
}

export function StudentNotificationsClient({
  initialNotifications,
  user,
}: StudentNotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isProcessing, setIsProcessing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsProcessing(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ASSIGNMENT:
        return <FileCheck className="h-5 w-5 text-blue-400" />;
      case NotificationType.QUIZ:
        return <HelpCircle className="h-5 w-5 text-purple-400" />;
      case NotificationType.HACKATHON:
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case NotificationType.ANNOUNCEMENT:
        return <Megaphone className="h-5 w-5 text-rose-400" />;
      case NotificationType.REMINDER:
        return <Clock className="h-5 w-5 text-orange-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-indigo-400" />;
    }
  };

  return (
    <DashboardShell user={user} title="Notifications & Activity">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Activity Feed & Reminders
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Stay up to date with new assignments, published quizzes, hackathons, and deadline reminders.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isProcessing}
              variant="outline"
              size="sm"
              className="gap-2 text-xs border-indigo-500/30 hover:bg-indigo-500/10 shrink-0"
            >
              <CheckCheck className="h-4 w-4 text-emerald-400" />
              <span>Mark all as read ({unreadCount})</span>
            </Button>
          )}
        </div>

        {/* List of Notifications */}
        {notifications.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/30 text-muted-foreground flex items-center justify-center mx-auto">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">No Notifications</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You&apos;re all caught up! When assignments, quizzes, or hackathons are posted, you&apos;ll see alerts here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const date = new Date(n.createdAt);

              return (
                <Card
                  key={n.id}
                  className={`border transition-all shadow-xs ${
                    n.read
                      ? "border-border/60 bg-card/60 opacity-80"
                      : "border-indigo-500/40 bg-indigo-500/5 shadow-xs"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-background border border-border/80 shrink-0">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {n.title}
                          </h4>
                          {!n.read && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-indigo-600">
                              NEW
                            </Badge>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {date.toLocaleDateString()} at{" "}
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>

                      <div className="pt-2 flex items-center gap-3">
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => {
                              if (!n.read) handleMarkAsRead(n.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                          >
                            <span>Open details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}

                        {!n.read && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
