"use server";

import { NotificationType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/auth";
import { db } from "@/lib/db";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Creates a notification record for a specific user.
 */
export async function createNotification({
  userId,
  title,
  message,
  type = NotificationType.SYSTEM,
  link,
}: CreateNotificationParams) {
  try {
    return await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Broadcasts a notification to all students enrolled in a specific class.
 */
export async function notifyClassStudents(
  classId: string,
  params: { title: string; message: string; type: NotificationType; link?: string }
) {
  try {
    const enrollments = await db.classMember.findMany({
      where: { classId },
      select: { studentId: true },
    });

    if (enrollments.length === 0) return [];

    const creations = enrollments.map((m) =>
      db.notification.create({
        data: {
          userId: m.studentId,
          title: params.title,
          message: params.message,
          type: params.type,
          link: params.link || null,
        },
      })
    );

    return await db.$transaction(creations);
  } catch (error) {
    console.error("Failed to notify class students:", error);
    return [];
  }
}

/**
 * Retrieves all notifications for the currently authenticated user.
 */
export async function getUserNotifications() {
  const user = await getCurrentAppUser();
  if (!user) return [];

  // Automatically check for upcoming due date reminders if student
  if (user.role === Role.STUDENT) {
    await checkDueRemindersForStudent(user.id);
  }

  return await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Retrieves unread notification count for the header bell.
 */
export async function getUnreadNotificationCount() {
  const user = await getCurrentAppUser();
  if (!user) return 0;

  return await db.notification.count({
    where: {
      userId: user.id,
      read: false,
    },
  });
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  const user = await getCurrentAppUser();
  if (!user) throw new Error("Unauthorized");

  const notif = await db.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notif || notif.userId !== user.id) {
    throw new Error("Unauthorized: Notification not found or access denied.");
  }

  await db.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  revalidatePath("/student/notifications");
  revalidatePath("/teacher/notifications");
  return { success: true };
}

/**
 * Marks all notifications for the current user as read.
 */
export async function markAllNotificationsAsRead() {
  const user = await getCurrentAppUser();
  if (!user) throw new Error("Unauthorized");

  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/student/notifications");
  revalidatePath("/teacher/notifications");
  return { success: true };
}

/**
 * Teacher sends a class-wide announcement.
 */
export async function createClassAnnouncement(formData: {
  classId: string;
  title: string;
  message: string;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const cls = await db.class.findFirst({
    where: { id: formData.classId, teacherId: user.id },
  });

  if (!cls) {
    throw new Error("Unauthorized: Classroom not found or not owned by you.");
  }

  await notifyClassStudents(formData.classId, {
    title: `📢 Announcement: ${formData.title}`,
    message: `${formData.message} (from ${cls.name})`,
    type: NotificationType.ANNOUNCEMENT,
    link: `/student/classes/${cls.id}`,
  });

  revalidatePath("/teacher/notifications");
  revalidatePath(`/teacher/classes/${cls.id}`);
  return { success: true };
}

/**
 * Internal helper to check and create due-date reminders for a student.
 */
async function checkDueRemindersForStudent(studentId: string) {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 48 * 60 * 60 * 1000); // within 48 hours

    // Find active assignments in student's enrolled classes
    const assignments = await db.assignment.findMany({
      where: {
        dueDate: {
          gt: now,
          lte: soon,
        },
        class: {
          members: {
            some: { studentId },
          },
        },
        submissions: {
          none: { studentId },
        },
      },
      include: {
        class: { select: { name: true } },
      },
    });

    for (const assignment of assignments) {
      const hoursRemaining = Math.max(
        1,
        Math.round((assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      );

      // Check if a reminder was already sent today for this assignment
      const existingReminder = await db.notification.findFirst({
        where: {
          userId: studentId,
          type: NotificationType.REMINDER,
          link: `/student/assignments/${assignment.id}`,
        },
      });

      if (!existingReminder) {
        await db.notification.create({
          data: {
            userId: studentId,
            title: `⏰ Due Date Reminder: ${assignment.title}`,
            message: `Assignment for "${assignment.class.name}" is due in approximately ${hoursRemaining} hour${
              hoursRemaining === 1 ? "" : "s"
            }. Please submit your work before the deadline.`,
            type: NotificationType.REMINDER,
            link: `/student/assignments/${assignment.id}`,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking due date reminders:", error);
  }
}
