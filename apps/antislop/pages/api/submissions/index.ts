import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const file = path.join(process.cwd(), 'data', 'submissions.json')
  try {
    const raw = await fs.readFile(file, 'utf-8')
    const data = JSON.parse(raw)
    res.status(200).json({ submissions: data })
  } catch (e) {
    res.status(200).json({ submissions: [] })
  }
}
