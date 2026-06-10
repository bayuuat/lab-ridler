import type { NextApiRequest, NextApiResponse } from 'next'

import { getDateKey, getDailyChallengeSlug, readProgress, readProblems } from '@/lib/problem-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const [problems, progress] = await Promise.all([readProblems(), readProgress()])
  const challengeSlug = getDailyChallengeSlug(problems)
  const challenge = problems.find((problem) => problem.slug === challengeSlug) || null
  const todayKey = getDateKey()
  const solvedToday = progress.completedDates.includes(todayKey)

  const calendarDays = Array.from({ length: 35 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (34 - index))
    const dateKey = getDateKey(date)
    return {
      dateKey,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      solved: progress.completedDates.includes(dateKey),
    }
  })

  res.status(200).json({
    challenge,
    progress,
    todayKey,
    solvedToday,
    calendarDays,
  })
}