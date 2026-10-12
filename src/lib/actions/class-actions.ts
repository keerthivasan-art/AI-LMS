"use server";

import { NotificationType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { syncUserWithDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUniqueClassCode } from "@/lib/class-code";
import { createNotification } from "./notification-actions";

const createClassSchema = z.object({
  name: z
    .string()
    .min(2, "Classroom name must be at least 2 characters")
    .max(100, "Classroom name cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

export interface ActionResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

/**
 * Server action for a Teacher to create a new Classroom.
 */
export async function createClassAction(formData: FormData): Promise<ActionResponse> {
  const user = await syncUserWithDb();
  if (!user) {
    return { error: "Authentication required. Please sign in." };
  }

  if (user.role !== Role.TEACHER) {
    return { error: "Forbidden: Only educators can create classrooms." };
  }

  const rawName = formData.get("name") as string;
  const rawDesc = formData.get("description") as string;

  const validation = createClassSchema.safeParse({
    name: rawName,
    description: rawDesc || undefined,
  });

  if (!validation.success) {
    const issue = validation.error.issues[0];
    return { error: issue ? issue.message : "Invalid classroom data." };
  }

  try {
    const joinCode = await generateUniqueClassCode();

    const newClass = await db.class.create({
      data: {
        name: validation.data.name,
        description: validation.data.description || null,
        joinCode,
        teacherId: user.id,
      },
    });

    revalidatePath("/teacher/classes");
    revalidatePath("/teacher/dashboard");

    return {
      success: true,
      data: {
        id: newClass.id,
        name: newClass.name,
        joinCode: newClass.joinCode,
      },
    };
  } catch (error) {
    console.error("Failed to create class:", error);
    return { error: "Failed to create classroom. Please try again." };
  }
}

/**
 * Retrieves classes created by the logged-in Teacher.
 */
export async function getTeacherClasses() {
  const user = await syncUserWithDb();
  if (!user || user.role !== Role.TEACHER) {
    return [];
  }

  try {
    return await db.class.findMany({
      where: { teacherId: user.id },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch teacher classes:", error);
    return [];
  }
}

/**
 * Retrieves details for a specific class owned by the logged-in Teacher.
 */
export async function getTeacherClassDetails(classId: string) {
  const user = await syncUserWithDb();
  if (!user || user.role !== Role.TEACHER) {
    return null;
  }

  try {
    const classData = await db.class.findUnique({
      where: { id: classId },
      include: {
        teacher: true,
        members: {
          include: {
            student: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!classData || classData.teacherId !== user.id) {
      return null;
    }

    return classData;
  } catch (error) {
    console.error("Failed to fetch teacher class details:", error);
    return null;
  }
}

/**
 * Server action for a Teacher to delete a classroom they own.
 */
export async function deleteClassAction(classId: string): Promise<ActionResponse> {
  const user = await syncUserWithDb();
  if (!user || user.role !== Role.TEACHER) {
    return { error: "Unauthorized operation." };
  }

  try {
    const classData = await db.class.findUnique({
      where: { id: classId },
    });

    if (!classData || classData.teacherId !== user.id) {
      return { error: "Classroom not found or unauthorized." };
    }

    await db.class.delete({
      where: { id: classId },
    });

    revalidatePath("/teacher/classes");
    revalidatePath("/teacher/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete classroom:", error);
    return { error: "Failed to delete classroom." };
  }
}

/**
 * Server action for a Student to join a Classroom by joinCode.
 */
export async function joinClassAction(formData: FormData): Promise<ActionResponse> {
  const user = await syncUserWithDb();
  if (!user) {
    return { error: "Authentication required. Please sign in." };
  }

  if (user.role !== Role.STUDENT) {
    return { error: "Forbidden: Only students can join classrooms using codes." };
  }

  const rawCode = formData.get("joinCode") as string;
  if (!rawCode || typeof rawCode !== "string") {
    return { error: "Classroom join code is required." };
  }

  const normalizedCode = rawCode.trim().toUpperCase();
  if (normalizedCode.length < 5 || normalizedCode.length > 12) {
    return { error: "Invalid classroom join code format." };
  }

  try {
    const targetClass = await db.class.findUnique({
      where: { joinCode: normalizedCode },
      include: {
        teacher: true,
      },
    });

    if (!targetClass) {
      return { error: "Invalid classroom code." };
    }

    const existingMembership = await db.classMember.findUnique({
      where: {
        classId_studentId: {
          classId: targetClass.id,
          studentId: user.id,
        },
      },
    });

    if (existingMembership) {
      return { error: "You are already enrolled in this classroom." };
    }

    await db.classMember.create({
      data: {
        classId: targetClass.id,
        studentId: user.id,
      },
    });

    // Notify teacher of new enrollment
    await createNotification({
      userId: targetClass.teacherId,
      title: `👤 New Student Joined: ${targetClass.name}`,
      message: `${user.name || user.email || "A student"} joined your classroom "${targetClass.name}".`,
      type: NotificationType.SYSTEM,
      link: `/teacher/classes/${targetClass.id}`,
    }).catch((e) => console.error("Failed to notify teacher:", e));

    // Notify student of enrollment
    await createNotification({
      userId: user.id,
      title: `🎉 Enrolled in ${targetClass.name}`,
      message: `You successfully joined ${targetClass.name} instructed by ${targetClass.teacher.name || "your teacher"}.`,
      type: NotificationType.SYSTEM,
      link: `/student/classes/${targetClass.id}`,
    }).catch((e) => console.error("Failed to notify student:", e));

    revalidatePath("/student/classes");
    revalidatePath("/student/dashboard");

    return {
      success: true,
      data: {
        id: targetClass.id,
        name: targetClass.name,
      },
    };
  } catch (error) {
    console.error("Failed to join classroom:", error);
    return { error: "Failed to join classroom. Please try again." };
  }
}

/**
 * Retrieves enrolled classes for the logged-in Student.
 */
export async function getStudentClasses() {
  const user = await syncUserWithDb();
  if (!user || user.role !== Role.STUDENT) {
    return [];
  }

  try {
    const memberships = await db.classMember.findMany({
      where: { studentId: user.id },
      include: {
        class: {
          include: {
            teacher: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return memberships.map((m) => m.class);
  } catch (error) {
    console.error("Failed to fetch student classes:", error);
    return [];
  }
}

/**
 * Retrieves class details for an enrolled Student.
 */
export async function getStudentClassDetails(classId: string) {
  const user = await syncUserWithDb();
  if (!user || user.role !== Role.STUDENT) {
    return null;
  }

  try {
    const membership = await db.classMember.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: user.id,
        },
      },
    });

    if (!membership) {
      return null;
    }

    return await db.class.findUnique({
      where: { id: classId },
      include: {
        teacher: true,
        members: {
          include: {
            student: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch student class details:", error);
    return null;
  }
}
