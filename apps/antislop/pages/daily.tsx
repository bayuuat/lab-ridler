import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function DailyPage() {
  const [daily, setDaily] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/daily')
      .then((r) => r.json())
      .then((d) => setDaily(d))
  }, [])

  if (!daily) {
    return <div>Loading...</div>
  }

  const { challenge, progress, calendarDays, solvedToday } = daily

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Habit
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Daily Challenge
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          One problem per day with streak tracking for consistency.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Today&apos;s challenge</CardTitle>
            <CardDescription>One deterministic problem per day keeps the habit loop simple.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-background/40 p-4 text-sm leading-7 text-muted-foreground">
              <p className="font-medium text-foreground">{challenge?.title}</p>
              <p className="mt-2">{challenge?.statement}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{challenge?.topic || 'daily'}</Badge>
              <Badge variant="outline">{challenge?.difficulty || 'easy'}</Badge>
              <Badge variant="outline">10-15 min</Badge>
            </div>
            {challenge && (
              <Button asChild>
                <Link href={`/problems/${challenge.slug}`}>Start solving</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Streak</CardTitle>
            <CardDescription>
              Solve today&apos;s challenge to keep the chain alive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Current streak: <span className="font-semibold text-foreground">{progress.currentStreak}</span> days</p>
            <p>Longest streak: <span className="font-semibold text-foreground">{progress.longestStreak}</span> days</p>
            <p>Today&apos;s status: <span className="font-semibold text-foreground">{solvedToday ? 'solved' : 'not solved yet'}</span></p>
            <div className="grid grid-cols-7 gap-2 pt-2">
              {calendarDays.map((day: any) => (
                <div
                  key={day.dateKey}
                  title={day.dateKey}
                  className={`flex h-10 items-center justify-center rounded-md border text-[10px] font-medium ${day.solved ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-border bg-background text-muted-foreground'}`}
                >
                  {day.dateKey.slice(8, 10)}
                </div>
              ))}
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              The grid shows the last 35 days of solved attempts.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}