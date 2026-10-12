declare module "mammoth" {
  export interface RawTextResult {
    value: string;
    messages: Array<{
      type: "warning" | "error";
      message: string;
    }>;
  }

  export function extractRawText(input: {
    buffer?: Buffer;
    path?: string;
    arrayBuffer?: ArrayBuffer;
  }): Promise<RawTextResult>;
}
