const fs = require('fs')
const path = require('path')

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function run() {
  const problemsPath = path.join(__dirname, '..', 'data', 'problems.json')
  const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'))
  const problem = problems[0]
  const slug = problem.slug

  // Build a passing Python submission: use sample-specific quickchecks + fallback brute-force
  const samples = problem.samples.map(s => ({ input: JSON.parse(s.input), output: JSON.parse(s.output) }))

  const passCode = `import json
SAMPLES = ${JSON.stringify(samples)}

def ${problem.entry_point}(*args):
    # match against known samples
    for inp, out in SAMPLES:
        if inp == list(args):
            return out
    # fallback brute-force for two-sum like problems (works for common small-array tasks)
    try:
        # specific fallback for two-sum style signatures
        if len(args) == 2 and isinstance(args[0], list) and isinstance(args[1], int):
            nums, target = args[0], args[1]
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    if nums[i] + nums[j] == target:
                        return [i, j]
    except Exception:
        pass
    # generic safe fallback: return first sample output
    return SAMPLES[0][1]
`

  const failCode = `def ${problem.entry_point}(*args):\n    return []\n`

  const baseUrl = 'http://localhost:3000'
  console.log('Testing slug:', slug)

  console.log('\n-> Submitting PASSING solution...')
  const passResp = await post(baseUrl + '/api/submissions/submit', { slug, code: passCode })
  console.log('Response:', passResp)
  if (passResp.verdict !== 'passed') {
    console.error('Expected passed verdict for passing submission — got', passResp.verdict)
    process.exitCode = 2
  }

  console.log('\n-> Submitting FAILING solution...')
  const failResp = await post(baseUrl + '/api/submissions/submit', { slug, code: failCode })
  console.log('Response:', failResp)
  if (failResp.verdict !== 'failed') {
    console.error('Expected failed verdict for failing submission — got', failResp.verdict)
    process.exitCode = 3
  }

  if (process.exitCode) {
    console.error('\nSmoke test failed.')
  } else {
    console.log('\nSmoke test succeeded: submit endpoint working for pass/fail cases.')
  }
}

run().catch(err => { console.error(err); process.exit(1) })
