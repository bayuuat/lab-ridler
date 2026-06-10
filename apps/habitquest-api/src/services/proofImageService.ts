import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const uploadRoot = path.resolve("uploads", "proofs");

const imageMimeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic"
};

function parseBase64Image(input: string) {
  const dataUrlMatch = input.match(/^data:(image\/(?:jpeg|png|heic));base64,(.+)$/);
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      base64: dataUrlMatch[2]
    };
  }

  return {
    mimeType: "image/jpeg",
    base64: input
  };
}

export async function saveProofImage(input: string) {
  const parsed = parseBase64Image(input);
  const extension = imageMimeToExtension[parsed.mimeType];

  if (!extension) {
    throw new Error("Unsupported proof image type");
  }

  const buffer = Buffer.from(parsed.base64, "base64");
  if (buffer.length === 0) {
    throw new Error("Proof image is empty");
  }

  await mkdir(uploadRoot, { recursive: true });

  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadRoot, fileName), buffer);

  return `${config.publicBaseUrl}/uploads/proofs/${fileName}`;
}
