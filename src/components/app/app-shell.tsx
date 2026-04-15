"use client";

import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ChartNoAxesColumn,
  LayoutDashboard,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/app/button-link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: Sparkles },
  { href: "/path", label: "Path", icon: BookOpenText },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumn },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,240,230,0.95),transparent_38%),linear-gradient(180deg,#fffdfa_0%,#fff8f2_40%,#fff 100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-start justify-between gap-4 rounded-[2rem] border border-border/60 bg-background/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {eyebrow}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Japanese v1
              </Badge>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Kotoba Companion
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
            </div>
          </div>
          <div className="hidden sm:block">{action}</div>
        </header>

        <div className="flex-1">{children}</div>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mt-8 sm:rounded-[2rem] sm:border sm:px-3">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <ButtonLink
                  key={item.href}
                  href={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "h-12 flex-1 rounded-2xl text-sm",
                    !isActive && "text-muted-foreground",
                  )}
                >
                  <Icon data-icon="inline-start" />
                  {item.label}
                </ButtonLink>
              );
            })}
            <ButtonLink
              href="/admin"
              variant={pathname.startsWith("/admin") ? "default" : "ghost"}
              className="hidden rounded-2xl text-sm sm:inline-flex"
            >
              <Shield data-icon="inline-start" />
              Admin
            </ButtonLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
