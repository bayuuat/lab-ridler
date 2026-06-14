import Link from 'next/link'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ProblemSummary = {
  slug: string
  title: string
  statement: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  solved: boolean
}

type ProblemsResponse = {
  problems: ProblemSummary[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  topics: string[]
  difficulties: string[]
  solvedCount: number
}

const defaultProblemsResponse: ProblemsResponse = {
  problems: [],
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  topics: [],
  difficulties: [],
  solvedCount: 0,
}

export default function ProblemsPage() {
  const [problemData, setProblemData] = useState<ProblemsResponse>(defaultProblemsResponse)
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [status, setStatus] = useState('all')
  const [pageSize, setPageSize] = useState(12)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })

    if (query.trim()) params.set('q', query.trim())
    if (topic !== 'all') params.set('topic', topic)
    if (difficulty !== 'all') params.set('difficulty', difficulty)
    if (status !== 'all') params.set('status', status)

    return params.toString()
  }, [difficulty, page, pageSize, query, status, topic])

  useEffect(() => {
    let isCurrentRequest = true
    setLoading(true)

    fetch(`/api/problems?${queryParams}`)
      .then((response) => response.json())
      .then((data: ProblemsResponse) => {
        if (!isCurrentRequest) return
        setProblemData({
          ...defaultProblemsResponse,
          ...data,
        })
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [queryParams])

  function resetToFirstPage() {
    setPage(1)
  }

  const startIndex = problemData.total === 0 ? 0 : (problemData.page - 1) * problemData.pageSize + 1
  const endIndex = Math.min(problemData.page * problemData.pageSize, problemData.total)

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Practice
        </Badge>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Problems
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Beginner-friendly problems will live here, starting with arrays,
              loops, strings, and hash maps.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            {problemData.solvedCount} solved
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 md:grid-cols-2 xl:col-span-3 xl:grid-cols-5">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetToFirstPage()
            }}
            placeholder="Search title, topic, or statement"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none xl:col-span-2"
          />
          <select
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value)
              resetToFirstPage()
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            {['all', ...problemData.topics].map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'All topics' : value}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value)
              resetToFirstPage()
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            {['all', ...problemData.difficulties].map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'All difficulty' : value}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              resetToFirstPage()
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="all">All status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>
          <div className="flex items-center justify-between gap-3 md:col-span-2 xl:col-span-5">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading problems...' : `Showing ${startIndex}-${endIndex} of ${problemData.total} problems`}
            </p>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  resetToFirstPage()
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                {[9, 12, 24, 48].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {problemData.problems.map((problem) => (
          <Card key={problem.slug} className={problem.solved ? 'border-emerald-200 bg-emerald-50/70' : 'bg-card/80'}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    {problem.solved && (
                      <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Solved
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{problem.statement}</CardDescription>
                </div>
                <Badge variant="outline">{problem.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <Badge>{problem.topic}</Badge>
              <Button asChild variant={problem.solved ? 'outline' : 'secondary'} size="sm">
                <Link href={`/problems/${problem.slug}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {!loading && problemData.problems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground xl:col-span-3">
            No problems match your filters yet.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="text-sm text-muted-foreground">
          Page {problemData.page} of {problemData.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            disabled={loading || problemData.page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, problemData.totalPages))}
            disabled={loading || problemData.page >= problemData.totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
