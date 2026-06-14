import type { NextApiRequest, NextApiResponse } from 'next'

import { readProblems, readSolvedProblemSlugs } from '@/lib/problem-store'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50

function readStringQuery(value: string | string[] | undefined, fallback = '') {
  if (Array.isArray(value)) return value[0] || fallback
  return value || fallback
}

function readPositiveIntQuery(value: string | string[] | undefined, fallback: number) {
  const rawValue = readStringQuery(value)
  const parsedValue = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const [problems, solvedSlugs] = await Promise.all([
    readProblems(),
    readSolvedProblemSlugs(),
  ])
  const solvedSet = new Set(solvedSlugs)

  const query = readStringQuery(req.query.q).trim().toLowerCase()
  const topic = readStringQuery(req.query.topic, 'all')
  const difficulty = readStringQuery(req.query.difficulty, 'all')
  const status = readStringQuery(req.query.status, 'all')
  const pageSize = Math.min(
    readPositiveIntQuery(req.query.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  )
  const page = readPositiveIntQuery(req.query.page, 1)

  const topics = Array.from(new Set(problems.map((problem) => problem.topic))).sort()
  const difficulties = Array.from(new Set(problems.map((problem) => problem.difficulty))).sort()

  const filteredProblems = problems.filter((problem) => {
    const matchesQuery = !query
      || `${problem.title} ${problem.statement} ${problem.topic}`.toLowerCase().includes(query)
    const matchesTopic = topic === 'all' || problem.topic === topic
    const matchesDifficulty = difficulty === 'all' || problem.difficulty === difficulty
    const isSolved = solvedSet.has(problem.slug)
    const matchesStatus = status === 'all'
      || (status === 'solved' && isSolved)
      || (status === 'unsolved' && !isSolved)

    return matchesQuery && matchesTopic && matchesDifficulty && matchesStatus
  })

  const total = filteredProblems.length
  const totalPages = Math.max(Math.ceil(total / pageSize), 1)
  const currentPage = Math.min(page, totalPages)
  const offset = (currentPage - 1) * pageSize

  const paginatedProblems = filteredProblems
    .slice(offset, offset + pageSize)
    .map((problem) => ({
      slug: problem.slug,
      title: problem.title,
      statement: problem.statement,
      topic: problem.topic,
      difficulty: problem.difficulty,
      solved: solvedSet.has(problem.slug),
    }))

  res.status(200).json({
    problems: paginatedProblems,
    page: currentPage,
    pageSize,
    total,
    totalPages,
    topics,
    difficulties,
    solvedCount: solvedSlugs.length,
  })
}
