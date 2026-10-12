"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { AppUser } from "@/types";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bell,
  CheckCheck,
  Megaphone,
  UserCheck,
  FileCheck,
  HelpCircle,
  Trophy,
  ArrowRight,
  Check,
  Loader2,
  Plus,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createClassAnnouncement,
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

interface ClassItem {
  id: string;
  name: string;
  joinCode: string;
}

interface TeacherNotificationsClientProps {
  initialNotifications: NotificationItem[];
  classes: ClassItem[];
  user: AppUser;
}

export function TeacherNotificationsClient({
  initialNotifications,
  classes,
  user,
}: TeacherNotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [announcementClassId, setAnnouncementClassId] = useState(classes[0]?.id || "");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

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

  const handlePostAnnouncement = async () => {
    if (!announcementClassId || !announcementTitle.trim() || !announcementMessage.trim()) return;
    setIsPosting(true);
    try {
      await createClassAnnouncement({
        classId: announcementClassId,
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
      });
      setIsAnnouncementOpen(false);
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      alert("Announcement sent successfully to all enrolled students!");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to post announcement.";
      alert(errorMsg);
    } finally {
      setIsPosting(false);
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
      default:
        return <UserCheck className="h-5 w-5 text-indigo-400" />;
    }
  };

  return (
    <DashboardShell user={user} title="Announcements & Alerts">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Announcements & Alerts
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Broadcast announcements to your classes and monitor notifications for enrolled students and submissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {classes.length > 0 && (
              <Button
                onClick={() => setIsAnnouncementOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Post Announcement</span>
              </Button>
            )}

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={isProcessing}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-indigo-500/30 hover:bg-indigo-500/10"
              >
                <CheckCheck className="h-4 w-4 text-emerald-400" />
                <span>Mark Read</span>
              </Button>
            )}
          </div>
        </div>

        {/* List of Notifications */}
        {notifications.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/30 text-muted-foreground flex items-center justify-center mx-auto">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">No Notifications Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                When students join your classrooms or submit work, you&apos;ll see real-time updates here.
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

        {/* Modal: Broadcast Class Announcement */}
        <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-indigo-400" />
                <span>Post Class Announcement</span>
              </DialogTitle>
              <DialogDescription>
                Send a notification and alert to all students enrolled in the selected classroom.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="font-semibold">Select Classroom *</Label>
                <select
                  value={announcementClassId}
                  onChange={(e) => setAnnouncementClassId(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.joinCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Announcement Title *</Label>
                <Input
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Exam Schedule Update or Study Material"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Announcement Message *</Label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  rows={4}
                  placeholder="Details of the announcement for your students..."
                  className="w-full p-2.5 text-xs bg-muted/20 border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAnnouncementOpen(false)}
                disabled={isPosting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostAnnouncement}
                disabled={
                  !announcementClassId ||
                  !announcementTitle.trim() ||
                  !announcementMessage.trim() ||
                  isPosting
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isPosting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Broadcast to Class</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
