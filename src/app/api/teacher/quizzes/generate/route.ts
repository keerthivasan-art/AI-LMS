import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getCurrentAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractTextFromDocx } from "@/lib/docx/extract-docx";
import { generateQuizQuestions } from "@/lib/ai/quiz-generator";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate and enforce TEACHER role
    const user = await getCurrentAppUser();
    if (!user || user.role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Unauthorized: Teacher access required." },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let classId = "";
    let title = "";
    let description = "";
    let questionCount = 5;
    let difficulty: "Easy" | "Medium" | "Hard" | "Mixed" = "Mixed";
    let marks = 1;
    let sourceContent = "";

    // 2. Handle multipart/form-data (File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      classId = (formData.get("classId") as string) || "";
      title = (formData.get("title") as string) || "";
      description = (formData.get("description") as string) || "";
      questionCount = parseInt((formData.get("questionCount") as string) || "5", 10);
      difficulty = ((formData.get("difficulty") as string) || "Mixed") as
        | "Easy"
        | "Medium"
        | "Hard"
        | "Mixed";
      marks = parseInt((formData.get("marks") as string) || "1", 10);

      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Please select a .docx Word document to upload." },
          { status: 400 }
        );
      }

      // Convert Web File to Buffer for mammoth
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const extraction = await extractTextFromDocx(buffer, file.name);
        sourceContent = extraction.text;
      } catch (extractErr: unknown) {
        const err = extractErr as { message?: string };
        return NextResponse.json(
          { error: err?.message || "Unable to extract readable text from this document." },
          { status: 400 }
        );
      }
    } else {
      // 3. Handle application/json (Pasted Text)
      const body = await req.json();
      classId = body.classId || "";
      title = body.title || "";
      description = body.description || "";
      questionCount = parseInt(String(body.questionCount || 5), 10);
      difficulty = (body.difficulty || "Mixed") as
        | "Easy"
        | "Medium"
        | "Hard"
        | "Mixed";
      marks = parseInt(String(body.marks || 1), 10);
      sourceContent = (body.sourceContent as string) || "";
    }

    // 4. Validate parameters
    if (!classId) {
      return NextResponse.json(
        { error: "Classroom selection is required." },
        { status: 400 }
      );
    }

    if (!title.trim()) {
      return NextResponse.json(
        { error: "Quiz title is required." },
        { status: 400 }
      );
    }

    if (!sourceContent.trim()) {
      return NextResponse.json(
        { error: "The uploaded document does not contain enough readable content." },
        { status: 400 }
      );
    }

    // 5. Verify teacher owns the selected class
    const targetClass = await db.class.findFirst({
      where: {
        id: classId,
        teacherId: user.id,
      },
    });

    if (!targetClass) {
      return NextResponse.json(
        { error: "Unauthorized: You do not own this classroom." },
        { status: 403 }
      );
    }

    // 6. Generate Questions with AI
    const result = await generateQuizQuestions({
      sourceContent,
      questionCount: Math.min(Math.max(questionCount, 1), 20),
      difficulty,
      marksPerQuestion: marks > 0 ? marks : 1,
      subjectContext: `${title} - ${targetClass.name} (${description || "General Assessment"})`,
    });

    // Return generated questions for teacher review (NOT saved yet!)
    return NextResponse.json({
      success: true,
      questions: result.questions,
      generatedCount: result.generatedCount,
      uniqueCount: result.uniqueCount,
      duplicateCount: result.duplicateCount,
      notice: result.notice,
    });
  } catch (error: unknown) {
    console.error("AI Quiz Generation Route Error:", error);
    const err = error as { message?: string };
    const userMessage =
      err?.message || "Unable to generate questions right now. Please try again.";

    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}
