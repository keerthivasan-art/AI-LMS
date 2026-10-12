import { db } from "@/lib/db";

// Characters used for class codes (excluding confusing characters like O, 0, I, 1)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 7;

function generateRandomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    code += CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Generates a unique join code on the server, retrying if a collision occurs.
 */
export async function generateUniqueClassCode(): Promise<string> {
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateRandomCode();
    const existingClass = await db.class.findUnique({
      where: { joinCode: code },
    });
    if (!existingClass) {
      return code;
    }
  }
  // Fallback timestamp appended code if max retries exceeded
  return `CS${Date.now().toString(36).toUpperCase().slice(-5)}`;
}
