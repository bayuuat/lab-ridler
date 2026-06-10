export async function callPythonApi(code: string, entryPoint: string, args: any[] = [], timeoutMs?: number) {
  const res = await fetch('/api/py/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, entryPoint, args, timeoutMs }),
  })
  return res.json()
}

export type PyRunResult = { stdout: string; stderr: string; exitCode: number | null; parsed: any }
