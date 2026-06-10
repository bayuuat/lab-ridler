import Link from 'next/link'

import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/problems', label: 'Problems' },
  { href: '/daily', label: 'Daily' },
  { href: '/roadmap', label: 'Roadmap' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.24em] uppercase text-foreground">
          AntiSlop
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
