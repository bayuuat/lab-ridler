import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), { ssr: false })

type Language = 'python' | 'javascript'

function getDraftStorageKey(problemSlug: string, language: Language) {
  return `antislop:draft:${problemSlug}:${language}`
}

function getLanguageStorageKey(problemSlug: string) {
  return `antislop:language:${problemSlug}`
}

function parsePythonSignature(starterCode: string) {
  const match = starterCode.match(/^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*:/m)
  if (!match) return null

  const [, name, paramsRaw] = match
  const params = paramsRaw.trim()
  return {
    name,
    params,
  }
}

function buildTemplateFromStarterCode(starterCode: string, language: Language) {
  const signature = parsePythonSignature(starterCode)
  if (!signature) return ''

  if (language === 'javascript') {
    return `function ${signature.name}(${signature.params}) {\n  // Write your solution here\n}\n`
  }

  return `def ${signature.name}(${signature.params}):\n    pass\n`
}

function getLanguageLabel(language: Language) {
  return language === 'javascript' ? 'JavaScript' : 'Python'
}

export default function ProblemDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [problem, setProblem] = useState<any | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<Language>('python')
  const [results, setResults] = useState<any[] | null>(null)
  const [verdict, setVerdict] = useState<'passed' | 'failed' | null>(null)
  const [summary, setSummary] = useState<{
    passedTests: number
    totalTests: number
    isDailyChallenge?: boolean
    habitQuestWebhook?: { status: 'skipped' | 'sent' | 'failed'; reason?: string }
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedLanguageRef = useRef<Language>('python')

  const exampleBlocks = useMemo(() => problem?.samples || [], [problem])

  useEffect(() => {
    const problemSlug = Array.isArray(slug) ? slug[0] : slug
    if (!problemSlug) return

    fetch(`/api/problems/${problemSlug}`)
      .then((r) => r.json())
      .then((d) => {
        const savedLanguage = typeof window !== 'undefined'
          ? (window.localStorage.getItem(getLanguageStorageKey(problemSlug)) as Language | null)
          : null
        const nextLanguage: Language = savedLanguage === 'javascript' ? 'javascript' : 'python'
        const template = buildTemplateFromStarterCode(d.problem?.starter_code || '', nextLanguage)
        const draftKey = getDraftStorageKey(problemSlug, nextLanguage)

        setProblem(d.problem)
        setLanguage(nextLanguage)
        selectedLanguageRef.current = nextLanguage
        setCode(() => {
          if (typeof window === 'undefined') return template
          const savedDraft = window.localStorage.getItem(draftKey)
          return savedDraft ?? template
        })
      })
  }, [slug])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  function handleCodeChange(value: string | undefined) {
    const nextCode = value || ''
    setCode(nextCode)

    const problemSlug = Array.isArray(slug) ? slug[0] : slug
    if (!problemSlug || typeof window === 'undefined') return

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      window.localStorage.setItem(getDraftStorageKey(problemSlug, selectedLanguageRef.current), nextCode)
    }, 500)
  }

  function handleLanguageChange(nextLanguage: Language) {
    const problemSlug = Array.isArray(slug) ? slug[0] : slug
    if (!problemSlug || !problem) return

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getDraftStorageKey(problemSlug, selectedLanguageRef.current), code)
      window.localStorage.setItem(getLanguageStorageKey(problemSlug), nextLanguage)
      const nextTemplate = buildTemplateFromStarterCode(problem.starter_code || '', nextLanguage)
      const nextDraft = window.localStorage.getItem(getDraftStorageKey(problemSlug, nextLanguage))

      setLanguage(nextLanguage)
      selectedLanguageRef.current = nextLanguage
      setCode(nextDraft ?? nextTemplate)
    } else {
      setLanguage(nextLanguage)
      selectedLanguageRef.current = nextLanguage
    }
  }

  async function run() {
    setLoading(true)
    setResults(null)
    setVerdict(null)
    setSummary(null)
    const r = await fetch('/api/submissions/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, code, language }),
    })
    const data = await r.json()
    setResults(data.results)
    setVerdict(data.verdict)
    setSummary({ passedTests: data.passedTests, totalTests: data.totalTests })
    setLoading(false)
  }

  async function submit() {
    setLoading(true)
    setResults(null)
    setVerdict(null)
    setSummary(null)
    const r = await fetch('/api/submissions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, code, language }),
    })
    const data = await r.json()
    setResults(data.sampleResults || [])
    setVerdict(data.verdict)
    setSummary({
      passedTests: data.passedTests,
      totalTests: data.totalTests,
      isDailyChallenge: data.isDailyChallenge,
      habitQuestWebhook: data.habitQuestWebhook,
    })
    setLoading(false)
  }

  if (!problem) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.3fr]">
      <aside className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{problem.topic}</Badge>
              <Badge variant="outline">{problem.difficulty}</Badge>
            </div>
            <CardTitle className="pt-2 text-2xl">{problem.title}</CardTitle>
            <CardDescription>Read the prompt carefully, then solve it in the editor on the right.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p className="text-foreground">{problem.statement}</p>
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">Example</h4>
                <div className="space-y-3">
                  {exampleBlocks.map((sample: any, index: number) => (
                    <div key={index} className="rounded-lg border border-border/60 bg-background p-3">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Case {index + 1}</div>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-foreground">Input:</span> <pre className="mt-1 whitespace-pre-wrap break-words rounded-md bg-muted/60 p-2 text-xs">{sample.input}</pre></div>
                        <div><span className="font-medium text-foreground">Output:</span> <pre className="mt-1 whitespace-pre-wrap break-words rounded-md bg-muted/60 p-2 text-xs">{sample.output}</pre></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      <main className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60 bg-muted/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{getLanguageLabel(language)} Editor</CardTitle>
                <CardDescription>Pick a language, then solve using the generated template and keep it readable.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
                  <span>Language</span>
                  <select
                    value={language}
                    onChange={(event) => handleLanguageChange(event.target.value as Language)}
                    className="bg-transparent text-sm font-medium text-foreground outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </label>
                <Button variant="secondary" onClick={run} disabled={loading}>
                  {loading ? 'Running...' : 'Run sample tests'}
                </Button>
                <Button onClick={submit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: 520 }}>
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                theme="vs-light"
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  wordWrap: 'on',
                }}
              />
            </div>
          </CardContent>
        </Card>

        {summary && (
          <Card className={verdict === 'passed' ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'}>
            <CardHeader>
              <CardTitle className="text-lg">
                {verdict === 'passed' ? 'Verdict: Accepted' : 'Verdict: Try again'}
              </CardTitle>
              <CardDescription>
                Passed {summary.passedTests} of {summary.totalTests} tests{summary.isDailyChallenge ? ' for today’s challenge.' : '.'}
              </CardDescription>
              {summary.habitQuestWebhook && (
                <CardDescription>
                  HabitQuest webhook: {summary.habitQuestWebhook.status}
                  {summary.habitQuestWebhook.reason ? ` (${summary.habitQuestWebhook.reason})` : ''}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        )}

        {results && (
          <div className="space-y-3">
            {results.map((r, i) => (
              <Card key={i} className="bg-card/60">
                <CardHeader>
                  <CardTitle className="text-base">Test {i + 1}: {r.pass ? 'Passed' : 'Failed'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3">Input: {r.input}</pre>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3">Expected: {r.expected}</pre>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3">Output: {r.stdout}</pre>
                    {r.stderr && <pre className="whitespace-pre-wrap rounded-md bg-rose-100 p-3 text-rose-700">Error: {r.stderr}</pre>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
