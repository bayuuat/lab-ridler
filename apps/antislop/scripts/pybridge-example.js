const http = require('http')

function postJSON(port, pathname, obj) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(obj)
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

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
  const code = `def greet(name):\n    return f"Hello, {name}!"\n`
  const entryPoint = 'greet'
  const args = ['World']

  console.log('Calling /api/py/run with greet(\'World\') on port', port)
  const resp = await postJSON(port, '/api/py/run', { code, entryPoint, args })
  console.log('Response:', resp)
}

main().catch(err => { console.error(err); process.exit(1) })
