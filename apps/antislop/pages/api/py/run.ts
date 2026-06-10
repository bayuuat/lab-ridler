import type { NextApiRequest, NextApiResponse } from 'next'
import { runPython } from '@/lib/judge'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { code, entryPoint, args, timeoutMs } = req.body
  if (typeof code !== 'string' || typeof entryPoint !== 'string') {
    return res.status(400).json({ error: 'missing code or entryPoint' })
  }

  const input = Array.isArray(args) ? JSON.stringify(args) : JSON.stringify(args ?? [])
  const timeout = typeof timeoutMs === 'number' ? timeoutMs : 3000

  const result = await runPython(code, input, entryPoint, timeout)

  // Try to parse stdout as JSON result
  let parsed = null
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    parsed = null
  }

  res.status(200).json({ stdout: result.stdout, stderr: result.stderr, exitCode: result.code, parsed })
}
