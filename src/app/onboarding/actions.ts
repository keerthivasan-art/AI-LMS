"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, syncUserWithDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const roleSchema = z.enum([Role.TEACHER, Role.STUDENT]);

export async function setInitialRole(formData: FormData): Promise<void> {
  if (!env.isClerkConfigured || !env.isDatabaseConfigured) {
    redirect("/sign-in?error=unconfigured");
  }

  const clerkUser = await getCurrentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const rawRole = formData.get("role");
  const validationResult = roleSchema.safeParse(rawRole);

  if (!validationResult.success) {
    redirect("/onboarding?error=invalid_role");
  }

  const selectedRole = validationResult.data;

  const user = await syncUserWithDb();
  if (!user) {
    redirect("/sign-in");
  }

  // Prevent overwriting existing user role (enforce role immutability)
  if (user.role) {
    if (user.role === Role.TEACHER) {
      redirect("/teacher/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  // Update DB user record securely using verified user record
  await db.user.update({
    where: { id: user.id },
    data: { role: selectedRole },
  });

  revalidatePath("/", "layout");
  if (selectedRole === Role.TEACHER) {
    redirect("/teacher/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}
