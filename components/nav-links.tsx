"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"

import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home", segment: null },
  { href: "/matches", label: "Matches", segment: "matches" },
  { href: "/members", label: "Members", segment: "members" },
  { href: "/teams", label: "Teams", segment: "teams" },
] as const

export function NavLinks() {
  const segment = useSelectedLayoutSegment()

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/80 p-1"
    >
      {links.map((link) => {
        const isActive = segment === link.segment

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
