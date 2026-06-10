import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

async function readProblems() {
  const file = path.join(process.cwd(), 'data', 'problems.json')
  const raw = await fs.readFile(file, 'utf-8')
  return JSON.parse(raw)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const problems = await readProblems()
  res.status(200).json({ problems })
}
