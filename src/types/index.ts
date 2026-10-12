import { Role } from "@prisma/client";

export type UserRole = Role;

export interface AppUser {
  id: string;
  clerkId: string;
  name: string | null;
  email: string;
  role: Role | null;
  createdAt: Date;
  updatedAt: Date;
}
