"use server";

import { NotificationType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification, notifyClassStudents } from "./notification-actions";

// Validation schemas
const createQuizSchema = z.object({
  title: z.string().min(1, "Quiz title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  classId: z.string().min(1, "Classroom selection is required"),
});

const addQuestionSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  question: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"], {
    message: "Please select a valid correct option (A, B, C, or D)",
  }),
  marks: z.coerce.number().int().min(1, "Marks must be at least 1").default(1),
});

/**
 * Teacher creates a new draft quiz for a class they own.
 */
export async function createQuiz(formData: {
  title: string;
  description?: string;
  classId: string;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = createQuizSchema.parse(formData);

  // Verify that the authenticated teacher owns the selected classroom
  const targetClass = await db.class.findFirst({
    where: {
      id: validated.classId,
      teacherId: user.id,
    },
  });

  if (!targetClass) {
    throw new Error("Unauthorized: You do not own this classroom.");
  }

  const quiz = await db.quiz.create({
    data: {
      title: validated.title.trim(),
      description: validated.description?.trim() || null,
      classId: validated.classId,
      teacherId: user.id,
      published: false,
    },
  });

  revalidatePath("/teacher/quizzes");
  revalidatePath("/teacher/dashboard");

  return { success: true, quiz };
}

/**
 * Teacher adds an MCQ question to a quiz they own.
 */
export async function addQuizQuestion(formData: {
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks?: number;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = addQuestionSchema.parse(formData);

  // Verify teacher owns the quiz
  const quiz = await db.quiz.findUnique({
    where: { id: validated.quizId },
    include: { questions: { select: { id: true } } },
  });

  if (!quiz || quiz.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this quiz.");
  }

  const question = await db.quizQuestion.create({
    data: {
      quizId: validated.quizId,
      question: validated.question.trim(),
      optionA: validated.optionA.trim(),
      optionB: validated.optionB.trim(),
      optionC: validated.optionC.trim(),
      optionD: validated.optionD.trim(),
      correctOption: validated.correctOption,
      marks: validated.marks || 1,
      order: quiz.questions.length + 1,
    },
  });

  revalidatePath(`/teacher/quizzes/${validated.quizId}`);

  return { success: true, question };
}

/**
 * Teacher deletes a question from a quiz they own.
 */
export async function deleteQuizQuestion(questionId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const question = await db.quizQuestion.findUnique({
    where: { id: questionId },
    include: { quiz: true },
  });

  if (!question || question.quiz.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this quiz question.");
  }

  await db.quizQuestion.delete({
    where: { id: questionId },
  });

  revalidatePath(`/teacher/quizzes/${question.quizId}`);

  return { success: true };
}

/**
 * Teacher publishes a draft quiz so it becomes visible to students.
 */
export async function publishQuiz(quizId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz || quiz.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this quiz.");
  }

  if (quiz.questions.length === 0) {
    throw new Error("Cannot publish quiz: Please add at least one MCQ question first.");
  }

  const updatedQuiz = await db.quiz.update({
    where: { id: quizId },
    data: { published: true },
  });

  // Notify enrolled students in the class
  await notifyClassStudents(quiz.classId, {
    title: `🧠 New Quiz Published: ${quiz.title}`,
    message: `A new quiz is available for you to test your skills in this class.`,
    type: NotificationType.QUIZ,
    link: `/student/quizzes/${quiz.id}`,
  }).catch((err) => console.error("Failed to notify students of quiz:", err));

  revalidatePath(`/teacher/quizzes/${quizId}`);
  revalidatePath("/teacher/quizzes");
  revalidatePath("/student/quizzes");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");

  return { success: true, quiz: updatedQuiz };
}

/**
 * Retrieves all quizzes created by the authenticated teacher.
 */
export async function getTeacherQuizzes() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    return [];
  }

  const quizzes = await db.quiz.findMany({
    where: { teacherId: user.id },
    include: {
      class: {
        select: { id: true, name: true, joinCode: true },
      },
      _count: {
        select: { questions: true, attempts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return quizzes.map((q) => ({
    ...q,
    questionCount: q._count.questions,
    attemptCount: q._count.attempts,
  }));
}

/**
 * Retrieves quiz details including questions and student attempts for teacher.
 */
export async function getTeacherQuizDetails(quizId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    return null;
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      class: {
        select: { id: true, name: true, joinCode: true },
      },
      questions: {
        orderBy: { order: "asc" },
      },
      attempts: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!quiz || quiz.teacherId !== user.id) {
    return null;
  }

  return quiz;
}

/**
 * Teacher deletes a quiz.
 */
export async function deleteQuiz(quizId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz || quiz.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this quiz.");
  }

  await db.quiz.delete({
    where: { id: quizId },
  });

  revalidatePath("/teacher/quizzes");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/quizzes");

  return { success: true };
}

/**
 * Retrieves all published quizzes for classes joined by the authenticated student.
 */
export async function getStudentQuizzes() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    return [];
  }

  const memberships = await db.classMember.findMany({
    where: { studentId: user.id },
    select: { classId: true },
  });

  const classIds = memberships.map((m) => m.classId);
  if (classIds.length === 0) {
    return [];
  }

  const quizzes = await db.quiz.findMany({
    where: {
      classId: { in: classIds },
      published: true,
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          teacher: { select: { name: true, email: true } },
        },
      },
      questions: {
        select: { id: true, marks: true },
      },
      attempts: {
        where: { studentId: user.id },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return quizzes.map((q) => {
    const attempt = q.attempts[0] || null;
    const totalMarks = q.questions.reduce((sum, item) => sum + item.marks, 0);

    return {
      id: q.id,
      title: q.title,
      description: q.description,
      class: q.class,
      questionCount: q.questions.length,
      totalMarks,
      attempt,
      status: attempt ? ("COMPLETED" as const) : ("AVAILABLE" as const),
    };
  });
}

/**
 * Retrieves student quiz details for attempting or viewing persistent results.
 */
export async function getStudentQuizDetails(quizId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    return null;
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId, published: true },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          teacher: { select: { name: true, email: true } },
          members: { where: { studentId: user.id } },
        },
      },
      questions: {
        orderBy: { order: "asc" },
      },
      attempts: {
        where: { studentId: user.id },
      },
    },
  });

  // Verify student is enrolled in the class
  if (!quiz || quiz.class.members.length === 0) {
    return null;
  }

  const attempt = quiz.attempts[0] || null;

  // Security: If student has NOT attempted the quiz yet, hide correctOption to prevent client tampering
  const sanitizedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    marks: q.marks,
    order: q.order,
  }));

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    class: quiz.class,
    questions: sanitizedQuestions,
    attempt,
    status: attempt ? ("COMPLETED" as const) : ("AVAILABLE" as const),
  };
}

/**
 * Server-side score calculation and quiz submission for students.
 */
export async function submitQuiz(formData: {
  quizId: string;
  answers: Record<string, "A" | "B" | "C" | "D">;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.STUDENT) {
    throw new Error("Unauthorized: Student access required.");
  }

  const { quizId, answers } = formData;
  if (!quizId || !answers) {
    throw new Error("Invalid submission data.");
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId, published: true },
    include: {
      class: {
        select: {
          members: { where: { studentId: user.id } },
        },
      },
      questions: true,
    },
  });

  if (!quiz || quiz.class.members.length === 0) {
    throw new Error("Unauthorized: You are not enrolled in this classroom.");
  }

  // Prevent duplicate attempts
  const existingAttempt = await db.quizAttempt.findUnique({
    where: {
      quizId_studentId: {
        quizId,
        studentId: user.id,
      },
    },
  });

  if (existingAttempt) {
    throw new Error("You have already completed this quiz.");
  }

  // Validate that every question has a selected answer
  const unanswered = quiz.questions.filter((q) => !answers[q.id]);
  if (unanswered.length > 0) {
    throw new Error("Please answer all questions before submitting.");
  }

  // SERVER-SIDE SCORE CALCULATION
  let score = 0;
  let totalMarks = 0;

  for (const q of quiz.questions) {
    totalMarks += q.marks;
    const studentChoice = answers[q.id];
    if (studentChoice === q.correctOption) {
      score += q.marks;
    }
  }

  const attempt = await db.quizAttempt.create({
    data: {
      quizId,
      studentId: user.id,
      score,
      totalMarks: totalMarks > 0 ? totalMarks : 1,
    },
  });

  revalidatePath(`/student/quizzes/${quizId}`);
  revalidatePath("/student/quizzes");
  revalidatePath("/student/dashboard");
  revalidatePath(`/teacher/quizzes/${quizId}`);

  const percentage = Math.round((score / (totalMarks || 1)) * 100);

  // Notify student of their score
  await createNotification({
    userId: user.id,
    title: `🎯 Quiz Completed: ${quiz.title}`,
    message: `You scored ${score}/${totalMarks} (${percentage}%) on ${quiz.title}.`,
    type: NotificationType.QUIZ,
    link: `/student/quizzes/${quizId}`,
  }).catch((err) => console.error("Failed to notify student of quiz result:", err));

  // Notify teacher of quiz submission
  await createNotification({
    userId: quiz.teacherId,
    title: `📊 Quiz Submission: ${quiz.title}`,
    message: `${user.name || "A student"} completed ${quiz.title} scoring ${score}/${totalMarks}.`,
    type: NotificationType.QUIZ,
    link: `/teacher/quizzes/${quizId}`,
  }).catch((err) => console.error("Failed to notify teacher of quiz submission:", err));

  return {
    success: true,
    attempt,
    score,
    totalMarks,
    percentage,
  };
}

const saveAiQuizSchema = z.object({
  classId: z.string().min(1, "Classroom is required"),
  title: z.string().min(1, "Quiz title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  questions: z
    .array(
      z.object({
        question: z.string().trim().min(1, "Question cannot be empty"),
        optionA: z.string().trim().min(1, "Option A cannot be empty"),
        optionB: z.string().trim().min(1, "Option B cannot be empty"),
        optionC: z.string().trim().min(1, "Option C cannot be empty"),
        optionD: z.string().trim().min(1, "Option D cannot be empty"),
        correctOption: z.enum(["A", "B", "C", "D"], {
          message: "Correct option must be A, B, C, or D",
        }),
        marks: z.coerce.number().int().min(1).default(1),
        explanation: z.string().optional(),
      })
    )
    .min(1, "At least one question is required to save a quiz"),
});

/**
 * Teacher saves an AI-generated quiz as a draft with all questions in a single transaction.
 */
export async function saveAiGeneratedQuiz(formData: {
  classId: string;
  title: string;
  description?: string;
  questions: Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    marks: number;
    explanation?: string;
  }>;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = saveAiQuizSchema.parse(formData);

  // Verify that the authenticated teacher owns the target classroom
  const targetClass = await db.class.findFirst({
    where: {
      id: validated.classId,
      teacherId: user.id,
    },
  });

  if (!targetClass) {
    throw new Error("Unauthorized: You do not own this classroom.");
  }

  // Create quiz draft and questions
  const quiz = await db.quiz.create({
    data: {
      title: validated.title.trim(),
      description: validated.description?.trim() || null,
      classId: validated.classId,
      teacherId: user.id,
      published: false,
      questions: {
        create: validated.questions.map((q, idx) => ({
          question: q.question.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctOption: q.correctOption,
          marks: q.marks || 1,
          order: idx + 1,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  revalidatePath("/teacher/quizzes");
  revalidatePath("/teacher/dashboard");

  return { success: true, quizId: quiz.id };
}

const updateQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  question: z.string().trim().min(1, "Question text is required"),
  optionA: z.string().trim().min(1, "Option A is required"),
  optionB: z.string().trim().min(1, "Option B is required"),
  optionC: z.string().trim().min(1, "Option C is required"),
  optionD: z.string().trim().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"], {
    message: "Please select a valid correct option (A, B, C, or D)",
  }),
  marks: z.coerce.number().int().min(1, "Marks must be at least 1").default(1),
});

/**
 * Teacher updates an existing MCQ question in a quiz they own.
 */
export async function updateQuizQuestion(formData: {
  questionId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = updateQuestionSchema.parse(formData);

  const existing = await db.quizQuestion.findUnique({
    where: { id: validated.questionId },
    include: { quiz: true },
  });

  if (!existing || existing.quiz.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this quiz question.");
  }

  const updated = await db.quizQuestion.update({
    where: { id: validated.questionId },
    data: {
      question: validated.question,
      optionA: validated.optionA,
      optionB: validated.optionB,
      optionC: validated.optionC,
      optionD: validated.optionD,
      correctOption: validated.correctOption,
      marks: validated.marks,
    },
  });

  revalidatePath(`/teacher/quizzes/${existing.quizId}`);

  return { success: true, question: updated };
}

