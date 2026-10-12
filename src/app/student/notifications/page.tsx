import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentAppUser } from "@/lib/auth";
import { getUserNotifications } from "@/lib/actions/notification-actions";
import { StudentNotificationsClient } from "./student-notifications-client";

export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    redirect("/dashboard");
  }

  const notifications = await getUserNotifications();

  return <StudentNotificationsClient initialNotifications={notifications} user={user} />;
}
