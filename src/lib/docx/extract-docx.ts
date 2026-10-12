import mammoth from "mammoth";

export interface DocxExtractionResult {
  text: string;
  wordCount: number;
  characterCount: number;
}

const MAX_DOCX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MIN_TEXT_LENGTH = 30; // Minimum readable characters
const MAX_TEXT_LENGTH = 60000; // 60,000 characters limit

/**
 * Validates and extracts readable text from a DOCX file buffer.
 */
export async function extractTextFromDocx(
  fileBuffer: Buffer,
  fileName: string
): Promise<DocxExtractionResult> {
  // 1. Validate file extension
  const lowerName = fileName.toLowerCase();
  if (!lowerName.endsWith(".docx")) {
    throw new Error("Only .docx Word documents are supported. Please upload a valid .docx file.");
  }

  // 2. Validate file size
  if (fileBuffer.length > MAX_DOCX_FILE_SIZE) {
    throw new Error("Document is too large. Maximum file size is 5 MB.");
  }

  if (fileBuffer.length < 100) {
    throw new Error("The uploaded document does not contain enough readable content.");
  }

  // 3. Verify ZIP header (DOCX is an OpenXML ZIP archive, starts with PK\x03\x04 or PK\x05\x06)
  if (
    fileBuffer.length >= 4 &&
    !(
      fileBuffer[0] === 0x50 &&
      fileBuffer[1] === 0x4b &&
      (fileBuffer[2] === 0x03 || fileBuffer[2] === 0x05)
    )
  ) {
    throw new Error("Invalid document format. The file is not a valid .docx archive.");
  }

  // 4. Extract raw text safely via mammoth
  let rawText = "";
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    rawText = result.value || "";
  } catch (err: unknown) {
    console.error("Mammoth extraction error:", err);
    throw new Error("Unable to extract readable text from this document.");
  }

  // 5. Clean and sanitize extracted text
  const cleanedText = rawText
    .replace(/\0/g, "") // Remove null bytes
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 6. Validate content length
  if (cleanedText.length < MIN_TEXT_LENGTH) {
    throw new Error("The uploaded document does not contain enough readable content.");
  }

  if (cleanedText.length > MAX_TEXT_LENGTH) {
    throw new Error(
      "Document is too large. Please upload a smaller document or paste the relevant section."
    );
  }

  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

  return {
    text: cleanedText,
    wordCount,
    characterCount: cleanedText.length,
  };
}
