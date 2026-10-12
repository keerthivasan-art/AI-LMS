import { NextRequest, NextResponse } from "next/server";
import { getCurrentAppUser, getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import OpenAI from "openai";

interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  socratic: `You are Athena, an expert AI Socratic Tutor. 
Your goal is to guide students to discover answers on their own through thought-provoking questions, hints, and encouragement.
Do not directly output final answers to homework problems immediately; instead, break down the concept into sub-questions.
Use clear, warm, and inspiring language. Use markdown formatting and KaTeX math notation (e.g. $e = mc^2$) when appropriate.`,

  explainer: `You are Socrates AI, a master educator who explains complex academic topics with absolute clarity.
Use intuitive real-world analogies, step-by-step breakdowns, structured bullet points, and key takeaway summaries.
Be concise yet thorough. Format all formulas in clear math notation and code snippets in styled code blocks.`,

  coder: `You are DevMentor AI, a senior software engineer and computer science professor.
Help students solve coding problems, debug errors, and master algorithms.
Always explain the time and space complexity (Big-O). Write clean, production-ready code with helpful comments.
Encourage modular design and modern best practices.`,

  exam_prep: `You are PrepMaster AI, a specialized exam preparation tutor.
Help students prepare for midterms, finals, SATs, and competitive exams.
Offer practice questions with multiple-choice options, detailed solution breakdowns, time-management tips, and flashcard-style concepts.`,

  summarizer: `You are BriefingAI, an expert study note generator.
Synthesize complex topics into structured bulleted executive summaries, core formulas, key terms, and active-recall review questions.`
};

export async function POST(req: NextRequest) {
  try {
    const appUser = await getCurrentAppUser();
    const clerkUser = !appUser ? await getCurrentUser() : null;

    const userName = appUser?.name || clerkUser?.firstName || "Student";
    const userId = appUser?.clerkId || clerkUser?.id || "anonymous-user";

    const body = await req.json();
    const {
      messages,
      subject = "General Learning",
      tutorMode = "socratic",
      sessionId,
    }: {
      messages: ChatMessageInput[];
      subject?: string;
      tutorMode?: string;
      sessionId?: string;
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Array of messages is required." },
        { status: 400 }
      );
    }

    const selectedSystemPrompt =
      SYSTEM_PROMPTS[tutorMode] || SYSTEM_PROMPTS.socratic;
    const fullSystemPrompt = `${selectedSystemPrompt}\n\nCurrent Subject Context: ${subject}.\nStudent Name: ${userName}.`;

    const lastUserMessage = messages[messages.length - 1];

    // Save message to Prisma database if DB is configured and sessionId exists
    let currentSessionId = sessionId;
    if (env.isDatabaseConfigured && userId) {
      try {
        const dbUser = await db.user.findUnique({
          where: { clerkId: userId },
        });

        if (dbUser) {
          if (!currentSessionId) {
            const newSession = await db.chatSession.create({
              data: {
                userId: dbUser.id,
                title: lastUserMessage.content.slice(0, 40) + "...",
                subject,
                tutorMode,
              },
            });
            currentSessionId = newSession.id;
          }

          if (currentSessionId && lastUserMessage.role === "user") {
            await db.chatMessage.create({
              data: {
                sessionId: currentSessionId,
                role: "user",
                content: lastUserMessage.content,
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn("Could not record chat session to database:", dbErr);
      }
    }

    // Check if real OpenAI API key is available
    if (env.isOpenAIConfigured && env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      // Stream the response back to client using ReadableStream
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let fullText = "";
          try {
            for await (const chunk of response) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                fullText += text;
                controller.enqueue(encoder.encode(text));
              }
            }

            // Record assistant message to DB after completion
            if (env.isDatabaseConfigured && currentSessionId && fullText) {
              try {
                await db.chatMessage.create({
                  data: {
                    sessionId: currentSessionId,
                    role: "assistant",
                    content: fullText,
                  },
                });
              } catch (e) {
                console.warn("Failed to store assistant message:", e);
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Session-Id": currentSessionId || "",
        },
      });
    }

    // Fallback: Rich Pedagogical Interactive AI Generator when no OpenAI key is set
    const userQuery = lastUserMessage.content;
    const fallbackResponse = generatePedagogicalResponse(
      userQuery,
      subject,
      tutorMode,
      userName
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate real-time streaming chunks with natural delays
        const chunks = fallbackResponse.match(/.{1,8}/g) || [fallbackResponse];
        let fullText = "";
        for (const chunk of chunks) {
          fullText += chunk;
          controller.enqueue(encoder.encode(chunk));
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        if (env.isDatabaseConfigured && currentSessionId && fullText) {
          try {
            await db.chatMessage.create({
              data: {
                sessionId: currentSessionId,
                role: "assistant",
                content: fullText,
              },
            });
          } catch (e) {
            console.warn("Failed to store assistant response:", e);
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Session-Id": currentSessionId || "",
      },
    });
  } catch (error) {
    console.error("Error in AI Tutor API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error in AI Tutor" },
      { status: 500 }
    );
  }
}

function generatePedagogicalResponse(
  query: string,
  subject: string,
  mode: string,
  userName: string
): string {
  const lowerQuery = query.toLowerCase();

  if (mode === "coder" || lowerQuery.includes("code") || lowerQuery.includes("python") || lowerQuery.includes("js")) {
    return `### 💡 AI Code Mentor Solution

Hello **${userName}**! Let's examine how to write clean, efficient code for your problem in **${subject}**.

\`\`\`typescript
// Quick Demonstration Code Example
function solveProblem<T>(inputData: T[]): { success: boolean; count: number } {
  console.log("Processing ${subject} data batch...", inputData.length);
  
  // Step 1: Filter valid inputs
  const validItems = inputData.filter(Boolean);

  return {
    success: true,
    count: validItems.length
  };
}

// Execution
const result = solveProblem(["concept_1", "concept_2", "concept_3"]);
console.log("Result:", result);
\`\`\`

#### 🔍 Key Takeaways & Complexity:
- **Time Complexity**: $\\mathcal{O}(N)$ linear scan over array elements.
- **Space Complexity**: $\\mathcal{O}(N)$ to store filtered results.

Would you like to extend this code to handle edge cases or error boundaries?`;
  }

  if (mode === "socratic") {
    return `Hello **${userName}**! Welcome to your **${subject}** Socratic study session. 🎯

That's a great question about: *"${query}"*.

Before I give you the final answer directly, let's explore step-by-step:

1. **What core principle do you think applies here?**
   Think about how the key elements interact in ${subject}.
2. **What happens if we isolate the main variable?**
   Consider the standard formula:
   $$E = mc^2 \\quad \\text{or} \\quad \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$

What do you notice when you compare these components? Reply with your first thought and we'll refine it together! 🚀`;
  }

  if (mode === "exam_prep") {
    return `### 📝 Practice Quiz & Exam Strategy for ${subject}

Hi **${userName}**! Let's test your readiness on **${subject}**.

#### 📌 Question 1 (Multiple Choice)
Regarding **${query}**, which of the following statements is **most accurate**?

- [ ] **A)** It strictly applies under ideal theoretical conditions.
- [ ] **B)** It scales logarithmically with input dimension $\\mathcal{O}(\\log N)$.
- [ ] **C)** It is a fundamental law verified across empirical trials.
- [ ] **D)** None of the above.

---
💡 *Tip for Exam Day*: Always eliminate options with extreme words like "always" or "never" first.

Which answer choice do you select? Reply with A, B, C, or D to check your score!`;
  }

  // Default Explainer Mode
  return `### 🧠 Understanding ${subject}: ${query}

Hi **${userName}**, let me break down this topic into clear, easy-to-understand concepts!

#### 1. Core Concept Overview
When studying **${subject}**, *"${query}"* centers around how foundational variables interact under set conditions.

#### 2. Visual / Mathematical Representation
$$f(x) = \\int_{a}^{b} g(t) \\, dt$$

#### 3. Why It Matters
- **Practical Application**: Used daily in computational analysis, research, and engineering.
- **Exam Importance**: Frequently tested in core subject assessments.

#### 🎯 Next Steps
Would you like a practical practice problem, a deeper dive into theoretical proofs, or a code example?`;
}
