export type HabitQuestWebhookResult =
  | { status: 'skipped'; reason: string }
  | { status: 'sent'; completionId?: string }
  | { status: 'failed'; reason: string }

type SendDailyCodingCompletionInput = {
  problemSlug: string
  solvedAt?: Date
}

export async function sendDailyCodingCompletionToHabitQuest({
  problemSlug,
  solvedAt = new Date(),
}: SendDailyCodingCompletionInput): Promise<HabitQuestWebhookResult> {
  const webhookUrl = process.env.HABITQUEST_WEBHOOK_URL
  const habitId = process.env.HABITQUEST_DAILY_CODING_HABIT_ID
  const secretKey = process.env.HABITQUEST_DAILY_CODING_SECRET_KEY

  if (!webhookUrl || !habitId || !secretKey) {
    return { status: 'skipped', reason: 'HabitQuest webhook env is not configured' }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habit_id: habitId,
        secret_key: secretKey,
        status: 'COMPLETED',
        source: 'AntiSlop',
        metadata: {
          problemSlug,
          solvedAt: solvedAt.toISOString(),
        },
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        status: 'failed',
        reason: data?.error || `HabitQuest webhook failed with HTTP ${response.status}`,
      }
    }

    return {
      status: 'sent',
      completionId: data?.completion?.id,
    }
  } catch (error) {
    return {
      status: 'failed',
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}
