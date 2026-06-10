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

export default function Home() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-4">
          <Badge className="w-fit bg-primary/15 text-primary hover:bg-primary/15">
            Personal coding practice workspace
          </Badge>
          <div className="space-y-3">
            <CardTitle className="text-4xl leading-tight sm:text-5xl">
              AntiSlop
            </CardTitle>
            <CardDescription className="max-w-2xl text-base sm:text-lg">
              A focused LeetCode-style app for learning DSA from the basics,
              solving one problem a day, and tracking your streak without the
              noise of a public platform.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/problems">Browse problems</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/daily">Open daily challenge</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What it covers</CardTitle>
            <CardDescription>
              The first problem track is intentionally small and beginner-first.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {['Arrays', 'Loops', 'Strings', 'Hash maps', 'Sorting', 'Two pointers'].map(
              (topic) => (
                <Badge key={topic} variant="outline">
                  {topic}
                </Badge>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">MVP shape</CardTitle>
            <CardDescription>
              One language, sample tests, hidden tests, and a streak calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            The app is private-first and built for you. That means fewer moving
            parts, faster iteration, and a cleaner path toward adding more
            advanced features later.
          </CardContent>
        </Card>
      </div>
    </section>
  )
}