import { describe, expect, it } from "vitest";
import { getHabitDay } from "../src/time/habitDay.js";

describe("getHabitDay", () => {
  it("counts 00:55 local time as the previous habit day", () => {
    const date = new Date("2026-06-04T17:55:00.000Z"); // 2026-06-05 00:55 Asia/Jakarta

    expect(getHabitDay(date, "Asia/Jakarta")).toBe("2026-06-04");
  });

  it("counts 01:05 local time as the new habit day", () => {
    const date = new Date("2026-06-04T18:05:00.000Z"); // 2026-06-05 01:05 Asia/Jakarta

    expect(getHabitDay(date, "Asia/Jakarta")).toBe("2026-06-05");
  });
});
