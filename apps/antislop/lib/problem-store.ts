import { promises as fs } from 'fs'
import path from 'path'

export type ProblemSample = {
  input: string
  output: string
}

export type Problem = {
  id: string
  title: string
  slug: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  statement: string
  entry_point: string
  starter_code: string
  samples: ProblemSample[]
  hidden_tests?: ProblemSample[]
  judge?:
    | {
        mode: 'exact'
      }
    | {
        mode: 'two-sum'
      }
}

export type SubmissionRecord = {
  id: string
  slug: string
  mode: 'run' | 'submit'
  language?: 'python' | 'javascript'
  createdAt: string
  code: string
  verdict: 'passed' | 'failed'
  passedTests: number
  totalTests: number
}

export type ProgressState = {
  currentStreak: number
  longestStreak: number
  lastSolvedDate: string | null
  completedDates: string[]
  solvedProblems: string[]
}

const dataDir = path.join(process.cwd(), 'data')
const problemsFile = path.join(dataDir, 'problems.json')
const submissionsFile = path.join(dataDir, 'submissions.json')
const progressFile = path.join(dataDir, 'progress.json')

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8')
}

export async function readProblems(): Promise<Problem[]> {
  return readJsonFile<Problem[]>(problemsFile, [])
}

export async function findProblem(slug: string): Promise<Problem | null> {
  const problems = await readProblems()
  return problems.find((problem) => problem.slug === slug) || null
}

export async function readSubmissions(): Promise<SubmissionRecord[]> {
  return readJsonFile<SubmissionRecord[]>(submissionsFile, [])
}

export async function saveSubmission(record: SubmissionRecord) {
  const submissions = await readSubmissions()
  submissions.push(record)
  await writeJsonFile(submissionsFile, submissions)
}

export async function readProgress(): Promise<ProgressState> {
  return readJsonFile<ProgressState>(progressFile, {
    currentStreak: 0,
    longestStreak: 0,
    lastSolvedDate: null,
    completedDates: [],
    solvedProblems: [],
  })
}

export async function saveProgress(progress: ProgressState) {
  await writeJsonFile(progressFile, progress)
}

export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function getYesterdayKey(date = new Date()) {
  const previous = new Date(date)
  previous.setDate(previous.getDate() - 1)
  return getDateKey(previous)
}

export function getDailyChallengeSlug(problems: Problem[], date = new Date()) {
  if (!problems.length) return null
  const dateKey = getDateKey(date)
  const seed = dateKey.replace(/-/g, '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return problems[seed % problems.length]?.slug || null
}

export async function recordSolve(slug: string, solvedAt = new Date()) {
  const progress = await readProgress()
  const dateKey = getDateKey(solvedAt)
  const yesterdayKey = getYesterdayKey(solvedAt)
  const completedDates = new Set(progress.completedDates)
  completedDates.add(dateKey)

  let currentStreak = progress.currentStreak
  if (progress.lastSolvedDate === dateKey) {
    currentStreak = progress.currentStreak
  } else if (progress.lastSolvedDate === yesterdayKey) {
    currentStreak = progress.currentStreak + 1
  } else {
    currentStreak = 1
  }

  const solvedProblems = new Set(progress.solvedProblems)
  solvedProblems.add(slug)

  const nextProgress: ProgressState = {
    currentStreak,
    longestStreak: Math.max(progress.longestStreak, currentStreak),
    lastSolvedDate: dateKey,
    completedDates: Array.from(completedDates).sort(),
    solvedProblems: Array.from(solvedProblems).sort(),
  }

  await saveProgress(nextProgress)
  return nextProgress
}
