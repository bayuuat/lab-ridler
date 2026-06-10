export const VERIFICATION_TYPES = ["TEXT_PROOF", "IMAGE_PROOF", "WEB_HOOK"] as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[number];

export const HABIT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED"
} as const;
