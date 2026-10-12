import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getCurrentAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!env.isDatabaseConfigured) {
      return NextResponse.json({ sessions: [] });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await db.chatSession.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json({ sessions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, subject, tutorMode } = body;

    if (!env.isDatabaseConfigured) {
      return NextResponse.json({
        session: {
          id: `temp-${Date.now()}`,
          title: title || "New Tutor Session",
          subject: subject || "General Learning",
          tutorMode: tutorMode || "socratic",
          messages: [],
        },
      });
    }

    let dbUser = await getCurrentAppUser();

    if (!dbUser) {
      const primaryEmail =
        user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        `${user.id}@example.com`;
      const fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.username || "Student";

      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: primaryEmail,
          name: fullName,
        },
      });
    }

    const session = await db.chatSession.create({
      data: {
        userId: dbUser.id,
        title: title || "New Tutor Session",
        subject: subject || "General Learning",
        tutorMode: tutorMode || "socratic",
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !env.isDatabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    await db.chatSession.deleteMany({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
