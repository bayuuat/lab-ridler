import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

async function readProblems() {
  const file = path.join(process.cwd(), 'data', 'problems.json')
  const raw = await fs.readFile(file, 'utf-8')
  return JSON.parse(raw)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  const problems = await readProblems()
  const p = problems.find((x: any) => x.slug === slug)
  if (!p) return res.status(404).json({ error: 'Problem not found' })
  res.status(200).json({ problem: p })
}
