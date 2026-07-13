"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export function NavLinks({
  links,
  adminLink,
}: {
  links: NavLink[];
  adminLink?: NavLink;
}) {
  const pathname = usePathname();

  const allLinks = adminLink ? [...links, adminLink] : links;

  return (
    <nav className="flex flex-wrap gap-2">
      {allLinks.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent text-muted-foreground hover:border-input hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
