import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'

import { evaluateProblem } from '@/lib/judge'
import { sendDailyCodingCompletionToHabitQuest } from '@/lib/habitquest-webhook'
import { findProblem, getDailyChallengeSlug, readProblems, recordSolve, saveSubmission } from '@/lib/problem-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { slug, code, language } = req.body
  if (!slug || !code) return res.status(400).json({ error: 'missing slug or code' })

  const problem = await findProblem(slug)
  if (!problem) return res.status(404).json({ error: 'Problem not found' })

  const outcome = await evaluateProblem(problem, code, true, language === 'javascript' ? 'javascript' : 'python')
  const sampleCount = problem.samples.length
  const sampleResults = outcome.results.slice(0, sampleCount)
  const dailySlug = getDailyChallengeSlug(await readProblems())

  let progress = null
  let habitQuestWebhook = null
  if (outcome.passAll && dailySlug === slug) {
    progress = await recordSolve(slug)
    habitQuestWebhook = await sendDailyCodingCompletionToHabitQuest({
      problemSlug: slug,
    })
  }

  await saveSubmission({
    id: randomUUID(),
    slug,
    mode: 'submit',
    createdAt: new Date().toISOString(),
    code,
    language: language === 'javascript' ? 'javascript' : 'python',
    verdict: outcome.passAll ? 'passed' : 'failed',
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
  })

  res.status(200).json({
    verdict: outcome.passAll ? 'passed' : 'failed',
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
    sampleResults,
    progress,
    isDailyChallenge: dailySlug === slug,
    habitQuestWebhook,
  })
}
