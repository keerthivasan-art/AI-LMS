import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentAppUser } from "@/lib/auth";
import { getUserNotifications } from "@/lib/actions/notification-actions";
import { getTeacherClasses } from "@/lib/actions/class-actions";
import { TeacherNotificationsClient } from "./teacher-notifications-client";

export const dynamic = "force-dynamic";

export default async function TeacherNotificationsPage() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    redirect("/dashboard");
  }

  const [notifications, classes] = await Promise.all([
    getUserNotifications(),
    getTeacherClasses(),
  ]);

  return (
    <TeacherNotificationsClient
      initialNotifications={notifications}
      classes={classes}
      user={user}
    />
  );
}
