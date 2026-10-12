import { currentUser as getClerkUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { AppUser } from "@/types";

export type { Role };
export type { AppUser };

/**
 * Retrieves the current authenticated Clerk user from session.
 * Returns null if unauthenticated or if Clerk environment keys are missing.
 */
export async function getCurrentUser() {
  if (!env.isClerkConfigured) {
    return null;
  }
  try {
    return await getClerkUser();
  } catch (error: unknown) {
    const err = error as { digest?: string; message?: string };
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Failed to fetch Clerk current user:", error);
    return null;
  }
}

/**
 * Requires an authenticated Clerk session.
 * Throws an Error if unauthenticated.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return user;
}

/**
 * Synchronizes the authenticated Clerk user with the PostgreSQL database.
 * Preserves existing role and creates a user record with role = null if new.
 */
export async function syncUserWithDb(): Promise<AppUser | null> {
  const clerkUser = await getCurrentUser();
  if (!clerkUser || !env.isDatabaseConfigured) {
    return null;
  }

  const rawEmail =
    clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    "";
  const primaryEmail = rawEmail.trim().toLowerCase();

  const fullName =
    clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.username || null;

  try {
    const existingUser = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
      if (existingUser.email !== primaryEmail || existingUser.name !== fullName) {
        return await db.user.update({
          where: { clerkId: clerkUser.id },
          data: {
            email: primaryEmail,
            name: fullName,
          },
        });
      }
      return existingUser;
    }

    if (primaryEmail) {
      const existingUserByEmail = await db.user.findUnique({
        where: { email: primaryEmail },
      });

      if (existingUserByEmail) {
        return await db.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            clerkId: clerkUser.id,
            name: fullName || existingUserByEmail.name,
          },
        });
      }
    }

    return await db.user.create({
      data: {
        clerkId: clerkUser.id,
        email: primaryEmail,
        name: fullName,
        role: null,
      },
    });
  } catch (error) {
    console.error("Failed to sync user with DB:", error);
    return null;
  }
}

/**
 * Retrieves the application user from database.
 */
export async function getAppUser(): Promise<AppUser | null> {
  return await syncUserWithDb();
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  return await syncUserWithDb();
}

/**
 * Retrieves the application role for the current user.
 */
export async function getAppRole(): Promise<Role | null> {
  const appUser = await getAppUser();
  return appUser ? appUser.role : null;
}

/**
 * Ensures the authenticated user possesses one of the allowed application roles.
 */
export async function requireRole(allowedRole: Role | Role[]) {
  const appUser = await syncUserWithDb();
  if (!appUser) {
    throw new Error("Unauthorized: User session required.");
  }

  if (!appUser.role) {
    return { user: appUser, authorized: false, redirect: "/onboarding" as const };
  }

  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (!allowedRoles.includes(appUser.role)) {
    return { user: appUser, authorized: false, redirect: "/unauthorized" as const };
  }

  return { user: appUser, authorized: true, redirect: null };
}

/**
 * Server-side guard requiring TEACHER role.
 */
export async function requireTeacher() {
  return await requireRole(Role.TEACHER);
}

/**
 * Server-side guard requiring STUDENT role.
 */
export async function requireStudent() {
  return await requireRole(Role.STUDENT);
}
