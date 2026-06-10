const fs = require('fs')
const path = require('path')
const http = require('http')

function postJSON(pathname, obj) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(obj)
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
    const options = {
      hostname: 'localhost',
      port,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function run() {
  const problemsPath = path.join(__dirname, '..', 'data', 'problems.json')
  const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'))
  const problem = problems[0]
  const slug = problem.slug

  const samples = problem.samples.map((s) => ({ input: JSON.parse(s.input), output: JSON.parse(s.output) }))

  const passCode = `import json\nSAMPLES = ${JSON.stringify(samples)}\n\ndef ${problem.entry_point}(*args):\n    for inp, out in SAMPLES:\n        if inp == list(args):\n            return out\n    try:\n        if len(args) == 2 and isinstance(args[0], list) and isinstance(args[1], int):\n            nums, target = args[0], args[1]\n            best = None\n            for i in range(len(nums)):\n                for j in range(i + 1, len(nums)):\n                    if nums[i] + nums[j] == target:\n                        if best is None or j < best[1] or (j == best[1] and i < best[0]):\n                            best = (i, j)\n            if best is not None:\n                return [best[0], best[1]]\n    except Exception:\n        pass\n    return SAMPLES[0][1]\n`

  const failCode = `def ${problem.entry_point}(*args):\n    return []\n`

  console.log('Testing slug:', slug)

  console.log('\n-> Submitting PASSING solution...')
  const passResp = await postJSON('/api/submissions/submit', { slug, code: passCode })
  console.log('Response:', passResp)
  if (passResp.verdict !== 'passed') {
    console.error('Expected passed verdict for passing submission — got', passResp.verdict)
    process.exitCode = 2
  }

  console.log('\n-> Submitting FAILING solution...')
  const failResp = await postJSON('/api/submissions/submit', { slug, code: failCode })
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

run().catch((err) => { console.error(err); process.exit(1) })
