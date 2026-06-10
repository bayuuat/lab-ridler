import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const milestones = [
  {
    title: 'Problem library',
    status: 'Complete',
    description: '30 beginner problems, filters, and readable detail pages.',
  },
  {
    title: 'Judge loop',
    status: 'Complete',
    description: 'Monaco editor, sample runs, hidden-test submit flow, and verdict panel.',
  },
  {
    title: 'Daily habit loop',
    status: 'Complete',
    description: 'Date-based daily challenge, streak tracking, and calendar grid.',
  },
  {
    title: 'Hardening',
    status: 'Next',
    description: 'Sandboxing and formal integration tests before public use.',
  },
]

export default function RoadmapPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Plan
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Roadmap
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          The MVP is intentionally small and focused on a clean solve loop.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {milestones.map((milestone) => (
          <Card key={milestone.title} className="bg-card/80">
            <CardHeader>
              <CardDescription>{milestone.status}</CardDescription>
              <CardTitle className="text-xl">{milestone.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {milestone.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}