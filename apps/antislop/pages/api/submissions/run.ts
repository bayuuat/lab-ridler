import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'

import { evaluateProblem } from '@/lib/judge'
import { findProblem, saveSubmission } from '@/lib/problem-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { slug, code, language } = req.body
  if (!slug || !code) return res.status(400).json({ error: 'missing slug or code' })

  const problem = await findProblem(slug)
  if (!problem) return res.status(404).json({ error: 'Problem not found' })

  const outcome = await evaluateProblem(problem, code, false, language === 'javascript' ? 'javascript' : 'python')

  await saveSubmission({
    id: randomUUID(),
    slug,
    mode: 'run',
    createdAt: new Date().toISOString(),
    code,
    language: language === 'javascript' ? 'javascript' : 'python',
    verdict: outcome.passAll ? 'passed' : 'failed',
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
  })

  res.status(200).json({
    results: outcome.results,
    passedTests: outcome.passedTests,
    totalTests: outcome.totalTests,
    verdict: outcome.passAll ? 'passed' : 'failed',
  })
}
