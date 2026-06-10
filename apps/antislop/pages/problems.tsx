import Link from 'next/link'
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

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => setProblems(d.problems || []))
  }, [])

  const topics = useMemo(() => ['all', ...new Set(problems.map((problem) => problem.topic))], [problems])
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesQuery = `${problem.title} ${problem.statement} ${problem.topic}`.toLowerCase().includes(query.toLowerCase())
      const matchesTopic = topic === 'all' || problem.topic === topic
      const matchesDifficulty = difficulty === 'all' || problem.difficulty === difficulty
      return matchesQuery && matchesTopic && matchesDifficulty
    })
  }, [difficulty, problems, query, topic])

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Practice
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Problems
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Beginner-friendly problems will live here, starting with arrays,
          loops, strings, and hash maps.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-3 grid gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 md:grid-cols-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, topic, or statement"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          />
          <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none">
            {topics.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'All topics' : value}
              </option>
            ))}
          </select>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none">
            {['all', 'easy', 'medium', 'hard'].map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'All difficulty' : value}
              </option>
            ))}
          </select>
        </div>

        {filteredProblems.map((problem) => (
          <Card key={problem.slug} className="bg-card/80">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                  <CardDescription className="mt-2">{problem.statement}</CardDescription>
                </div>
                <Badge variant="outline">{problem.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <Badge>{problem.topic}</Badge>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/problems/${problem.slug}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredProblems.length === 0 && (
          <div className="xl:col-span-3 rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
            No problems match your filters yet.
          </div>
        )}
      </div>
    </section>
  )
}