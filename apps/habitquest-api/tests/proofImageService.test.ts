import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { saveProofImage } from "../src/services/proofImageService.js";

describe("saveProofImage", () => {
  it("stores a base64 proof image and returns a public URL", async () => {
    const onePixelPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

    const proofUrl = await saveProofImage(onePixelPng);
    const fileName = proofUrl.split("/").at(-1);

    expect(proofUrl).toContain("/uploads/proofs/");
    expect(fileName).toMatch(/\.png$/);
    expect(existsSync(`uploads/proofs/${fileName}`)).toBe(true);
  });
});
