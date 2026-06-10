const fs = require('fs')
const path = require('path')

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function getDailyChallengeSlug(problems, date = new Date()) {
  if (!problems.length) return null
  const dateKey = getDateKey(date)
  const seed = dateKey.replace(/-/g, '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return problems[seed % problems.length]?.slug || null
}

const problems = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'problems.json'), 'utf8'))
const slug = getDailyChallengeSlug(problems, new Date())
const problem = problems.find(p => p.slug === slug)
console.log('Today:', new Date().toISOString().slice(0,10))
console.log('Daily slug:', slug)
if (problem) {
  console.log('Title:', problem.title)
  console.log('Starter code:\n')
  console.log(problem.starter_code)
} else {
  console.log('No problem found for slug')
}
