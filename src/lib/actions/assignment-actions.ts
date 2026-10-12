"use server";

import { NotificationType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification, notifyClassStudents } from "./notification-actions";

// Zod schemas for server-side validation
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class selection is required"),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.coerce.number().int().min(1, "Maximum marks must be at least 1"),
});

const evaluateSubmissionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  marks: z.coerce.number().int().min(0, "Marks cannot be negative"),
  feedback: z.string().optional(),
});

const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  content: z.string().min(1, "Submission content cannot be empty"),
});

/**
 * Creates a new assignment for a class owned by the authenticated teacher.
 */
export async function createAssignment(formData: {
  title: string;
  description?: string;
  classId: string;
  dueDate: string;
  maxMarks: number;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = createAssignmentSchema.parse(formData);

  // Verify that the authenticated teacher owns the selected class
  const targetClass = await db.class.findFirst({
    where: {
      id: validated.classId,
      teacherId: user.id,
    },
  });

  if (!targetClass) {
    throw new Error("Unauthorized: You do not own this classroom.");
  }

  const dueDate = new Date(validated.dueDate);
  if (isNaN(dueDate.getTime())) {
    throw new Error("Invalid due date format.");
  }

  const assignment = await db.assignment.create({
    data: {
      title: validated.title.trim(),
      description: validated.description?.trim() || null,
      dueDate,
      maxMarks: validated.maxMarks,
      classId: validated.classId,
      teacherId: user.id,
    },
  });

  // Notify all enrolled students in the class
  await notifyClassStudents(validated.classId, {
    title: `📝 New Assignment: ${assignment.title}`,
    message: `A new assignment has been posted in ${targetClass.name}. Due on ${dueDate.toLocaleDateString()}.`,
    type: NotificationType.ASSIGNMENT,
    link: `/student/assignments/${assignment.id}`,
  }).catch((err) => console.error("Failed to notify students:", err));

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/assignments");
  revalidatePath(`/teacher/classes/${validated.classId}`);

  return { success: true, assignment };
}

/**
 * Retrieves all assignments created by the authenticated teacher.
 */
export async function getTeacherAssignments() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    return [];
  }

  const assignments = await db.assignment.findMany({
    where: {
      teacherId: user.id,
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          joinCode: true,
        },
      },
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  return assignments.map((assignment) => {
    let status: "ACTIVE" | "DUE" | "CLOSED" = "ACTIVE";
    const dueDate = new Date(assignment.dueDate);
    const timeDiffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (now > dueDate) {
      status = "CLOSED";
    } else if (timeDiffHours <= 24) {
      status = "DUE";
    }

    return {
      ...assignment,
      submissionCount: assignment._count.submissions,
      status,
    };
  });
}

/**
 * Retrieves details for a specific teacher assignment including all student submissions.
 */
export async function getTeacherAssignmentDetails(assignmentId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    return null;
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          joinCode: true,
          _count: {
            select: { members: true },
          },
        },
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      },
    },
  });

  if (!assignment || assignment.teacherId !== user.id) {
    return null;
  }

  return assignment;
}

/**
 * Deletes an assignment owned by the authenticated teacher.
 */
export async function deleteAssignment(assignmentId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment || assignment.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this assignment.");
  }

  await db.assignment.delete({
    where: { id: assignmentId },
  });

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/assignments");

  return { success: true };
}

/**
 * Evaluates a student submission with marks and feedback.
 */
export async function evaluateSubmission(formData: {
  submissionId: string;
  marks: number;
  feedback?: string;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = evaluateSubmissionSchema.parse(formData);

  const submission = await db.submission.findUnique({
    where: { id: validated.submissionId },
    include: {
      assignment: true,
    },
  });

  if (!submission || submission.assignment.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this assignment submission.");
  }

  if (validated.marks > submission.assignment.maxMarks) {
    throw new Error(
      `Marks (${validated.marks}) cannot exceed maximum marks (${submission.assignment.maxMarks}).`
    );
  }

  const updatedSubmission = await db.submission.update({
    where: { id: validated.submissionId },
    data: {
      marks: validated.marks,
      feedback: validated.feedback?.trim() || null,
      evaluatedAt: new Date(),
    },
  });

  // Notify student of the evaluation result
  await createNotification({
    userId: submission.studentId,
    title: `✅ Assignment Evaluated: ${submission.assignment.title}`,
    message: `Your submission received ${validated.marks}/${submission.assignment.maxMarks} marks.${
      validated.feedback ? ` Feedback: "${validated.feedback}"` : ""
    }`,
    type: NotificationType.ASSIGNMENT,
    link: `/student/assignments/${submission.assignmentId}`,
  }).catch((err) => console.error("Failed to notify student of evaluation:", err));

  revalidatePath(`/teacher/assignments/${submission.assignmentId}`);
  revalidatePath(`/student/assignments/${submission.assignmentId}`);

  return { success: true, submission: updatedSubmission };
}

/**
 * Retrieves all assignments from classes joined by the authenticated student.
 */
export async function getStudentAssignments() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    return [];
  }

  // Find all classes joined by this student
  const memberships = await db.classMember.findMany({
    where: { studentId: user.id },
    select: { classId: true },
  });

  const classIds = memberships.map((m) => m.classId);
  if (classIds.length === 0) {
    return [];
  }

  const assignments = await db.assignment.findMany({
    where: {
      classId: { in: classIds },
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          teacher: {
            select: { name: true, email: true },
          },
        },
      },
      submissions: {
        where: {
          studentId: user.id,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const now = new Date();

  return assignments.map((assignment) => {
    const submission = assignment.submissions[0] || null;
    const dueDate = new Date(assignment.dueDate);

    let status: "NOT SUBMITTED" | "SUBMITTED" | "EVALUATED" | "OVERDUE" = "NOT SUBMITTED";

    if (submission) {
      if (submission.marks !== null) {
        status = "EVALUATED";
      } else {
        status = "SUBMITTED";
      }
    } else if (now > dueDate) {
      status = "OVERDUE";
    }

    return {
      ...assignment,
      submission,
      status,
    };
  });
}

/**
 * Retrieves details for a specific student assignment if enrolled in the class.
 */
export async function getStudentAssignmentDetails(assignmentId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    return null;
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          teacher: {
            select: { name: true, email: true },
          },
          members: {
            where: { studentId: user.id },
          },
        },
      },
      submissions: {
        where: { studentId: user.id },
      },
    },
  });

  // Verify student is enrolled in the class
  if (!assignment || assignment.class.members.length === 0) {
    return null;
  }

  const submission = assignment.submissions[0] || null;
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);

  let status: "NOT SUBMITTED" | "SUBMITTED" | "EVALUATED" | "OVERDUE" = "NOT SUBMITTED";

  if (submission) {
    if (submission.marks !== null) {
      status = "EVALUATED";
    } else {
      status = "SUBMITTED";
    }
  } else if (now > dueDate) {
    status = "OVERDUE";
  }

  return {
    ...assignment,
    submission,
    status,
  };
}

/**
 * Submits text assignment response for an enrolled student.
 */
export async function submitAssignment(formData: {
  assignmentId: string;
  content: string;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    throw new Error("Unauthorized: Student access required.");
  }

  const validated = submitAssignmentSchema.parse(formData);

  const assignment = await db.assignment.findUnique({
    where: { id: validated.assignmentId },
    include: {
      class: {
        select: {
          members: {
            where: { studentId: user.id },
          },
        },
      },
    },
  });

  if (!assignment || assignment.class.members.length === 0) {
    throw new Error("Unauthorized: You are not enrolled in this classroom.");
  }

  // Prevent duplicate submissions for the same assignment and student
  const existingSubmission = await db.submission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId: validated.assignmentId,
        studentId: user.id,
      },
    },
  });

  if (existingSubmission) {
    throw new Error("You have already submitted this assignment.");
  }

  const submission = await db.submission.create({
    data: {
      assignmentId: validated.assignmentId,
      studentId: user.id,
      content: validated.content.trim(),
    },
  });

  revalidatePath(`/student/assignments/${validated.assignmentId}`);
  revalidatePath("/student/assignments");
  revalidatePath("/student/dashboard");
  revalidatePath(`/teacher/assignments/${validated.assignmentId}`);

  return { success: true, submission };
}
