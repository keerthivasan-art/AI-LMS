"use server";

import { NotificationType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "./notification-actions";
import { env } from "@/lib/env";
import OpenAI from "openai";

const hackathonSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().optional(),
  url: z.string().trim().url("Must be a valid URL"),
  organizer: z.string().trim().optional(),
  location: z.string().trim().default("Online"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  registrationDeadline: z.string().optional().nullable(),
  published: z.boolean().default(false),
});

/**
 * Extracts hackathon details from a website URL or pasted event text.
 * Allows teacher to inspect and review all fields before saving or publishing.
 */
export async function extractHackathonDetails(input: {
  url?: string;
  rawText?: string;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const { url, rawText } = input;
  if (!url && !rawText) {
    throw new Error("Please provide either a hackathon URL or event text.");
  }

  let textToAnalyze = rawText || "";
  const targetUrl = url || "";

  // If a URL is provided and no rawText, fetch the public page content if possible
  if (url && !textToAnalyze) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (AI-LMS Event Bot)" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const html = await response.text();
        // Simple HTML text extraction
        textToAnalyze = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 3000);
      }
    } catch {
      // Fallback if fetch fails (e.g. CORS, bot protection or offline)
      textToAnalyze = `Hackathon at ${url}`;
    }
  }

  // Use OpenAI if configured for structured extraction, else intelligent heuristics
  if (env.isOpenAIConfigured && env.OPENAI_API_KEY && textToAnalyze.length > 30) {
    try {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You extract structured hackathon details from event descriptions. Output ONLY valid JSON with keys:
            title (string),
            organizer (string),
            description (string, 2 sentences max),
            location (string, e.g. "Online" or city),
            startDate (ISO string YYYY-MM-DD or empty),
            endDate (ISO string YYYY-MM-DD or empty),
            registrationDeadline (ISO string YYYY-MM-DD or empty)`
          },
          {
            role: "user",
            content: `Extract from this content:\n${textToAnalyze.slice(0, 2000)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return {
        success: true,
        data: {
          title: parsed.title || "Upcoming Hackathon",
          organizer: parsed.organizer || "Community Organizer",
          description: parsed.description || "Exciting hackathon opportunity for students to build and collaborate.",
          url: targetUrl || "https://devpost.com",
          location: parsed.location || "Online",
          startDate: parsed.startDate || null,
          endDate: parsed.endDate || null,
          registrationDeadline: parsed.registrationDeadline || null,
        },
      };
    } catch (aiErr) {
      console.warn("AI extraction fallback to heuristics:", aiErr);
    }
  }

  // Intelligent Heuristic fallback
  const urlDomain = targetUrl ? new URL(targetUrl).hostname.replace("www.", "") : "Online";
  const titleMatch = textToAnalyze.match(/(?:hackathon|hack|challenge|buildathon)[\s\w-]+/i);
  const title = titleMatch ? titleMatch[0].trim() : `Tech Hackathon (${urlDomain})`;

  return {
    success: true,
    data: {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      organizer: urlDomain.split(".")[0]?.toUpperCase() || "Global Tech Community",
      description: textToAnalyze.slice(0, 180) || "Join innovators, developers, and students in this collaborative hackathon challenge.",
      url: targetUrl || "https://devpost.com",
      location: "Online",
      startDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 9 * 86400000).toISOString().split("T")[0],
      registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    },
  };
}

/**
 * Saves a new hackathon created/reviewed by the teacher.
 */
export async function saveHackathon(formData: {
  id?: string;
  title: string;
  description?: string;
  url: string;
  organizer?: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  registrationDeadline?: string | null;
  published: boolean;
}) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const validated = hackathonSchema.parse(formData);

  const start = validated.startDate ? new Date(validated.startDate) : null;
  const end = validated.endDate ? new Date(validated.endDate) : null;
  const deadline = validated.registrationDeadline ? new Date(validated.registrationDeadline) : null;

  let hackathon;

  if (formData.id) {
    // Update existing
    const existing = await db.hackathon.findUnique({
      where: { id: formData.id },
    });
    if (!existing || existing.teacherId !== user.id) {
      throw new Error("Unauthorized: You do not own this hackathon entry.");
    }

    hackathon = await db.hackathon.update({
      where: { id: formData.id },
      data: {
        title: validated.title,
        description: validated.description || null,
        url: validated.url,
        organizer: validated.organizer || null,
        location: validated.location || "Online",
        startDate: start,
        endDate: end,
        registrationDeadline: deadline,
        published: validated.published,
      },
    });
  } else {
    // Create new
    hackathon = await db.hackathon.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        url: validated.url,
        organizer: validated.organizer || null,
        location: validated.location || "Online",
        startDate: start,
        endDate: end,
        registrationDeadline: deadline,
        published: validated.published,
        teacherId: user.id,
      },
    });
  }

  // If newly published, broadcast notification to all students in teacher's classes
  if (validated.published) {
    const studentMemberships = await db.classMember.findMany({
      where: {
        class: { teacherId: user.id },
      },
      select: { studentId: true },
      distinct: ["studentId"],
    });

    for (const member of studentMemberships) {
      await createNotification({
        userId: member.studentId,
        title: `🏆 New Hackathon Opportunity: ${hackathon.title}`,
        message: `${hackathon.organizer ? `${hackathon.organizer} presents: ` : ""}${hackathon.title}. Check it out on your Hackathons portal!`,
        type: NotificationType.HACKATHON,
        link: `/student/hackathons`,
      }).catch((e) => console.error("Failed to notify student of hackathon:", e));
    }
  }

  revalidatePath("/teacher/hackathons");
  revalidatePath("/student/hackathons");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");

  return { success: true, hackathon };
}

/**
 * Retrieves all hackathons created by the authenticated teacher.
 */
export async function getTeacherHackathons() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    return [];
  }

  return await db.hackathon.findMany({
    where: { teacherId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Deletes a hackathon.
 */
export async function deleteHackathon(hackathonId: string) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== Role.TEACHER) {
    throw new Error("Unauthorized: Teacher access required.");
  }

  const existing = await db.hackathon.findUnique({
    where: { id: hackathonId },
  });

  if (!existing || existing.teacherId !== user.id) {
    throw new Error("Unauthorized: You do not own this hackathon entry.");
  }

  await db.hackathon.delete({
    where: { id: hackathonId },
  });

  revalidatePath("/teacher/hackathons");
  revalidatePath("/student/hackathons");

  return { success: true };
}

/**
 * Retrieves all published hackathons for students.
 */
export async function getStudentHackathons() {
  const user = await getCurrentAppUser();
  if (!user) {
    return [];
  }

  return await db.hackathon.findMany({
    where: { published: true },
    include: {
      teacher: {
        select: { name: true, email: true },
      },
    },
    orderBy: {
      registrationDeadline: "asc",
    },
  });
}
