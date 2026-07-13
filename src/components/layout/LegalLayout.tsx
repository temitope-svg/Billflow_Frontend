import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, type LucideIcon } from 'lucide-react'
import { LogoBrand } from '../BillflowLogo'
import { Button } from '../ui/Button'
import { useScrollSpy } from '../../hooks/useScrollSpy'

export interface LegalSectionMeta {
  id: string
  title: string
}

interface LegalLayoutProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  intro: string
  updated: string
  sections: LegalSectionMeta[]
  children: ReactNode
}

export function LegalLayout({
  icon: Icon,
  eyebrow,
  title,
  intro,
  updated,
  sections,
  children,
}: LegalLayoutProps) {
  const activeId = useScrollSpy(sections.map((s) => s.id))

  return (
    <div className="min-h-svh bg-white text-slate-900">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur md:px-8">
        <Link to="/">
          <LogoBrand />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost" className="text-sm">Log in</Button>
          </Link>
          <Link to="/register">
            <Button className="text-sm">Get started free</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50 to-white px-6 py-14 md:px-8 md:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.12), transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-indigo-200">
            <Icon className="h-6 w-6" />
          </span>
          <p className="mt-5 text-xs font-semibold tracking-widest text-brand uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            {intro}
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Last updated {updated}
          </span>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:px-8 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <p className="mb-3 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              On this page
            </p>
            <ul className="space-y-1 border-l border-slate-200">
              {sections.map((s) => {
                const active = activeId === s.id
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`-ml-px block border-l-2 py-1 pl-4 text-xs leading-snug transition ${
                        active
                          ? 'border-brand font-medium text-brand'
                          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0">
          <div className="space-y-10 text-slate-600">{children}</div>

          <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Still have questions?</p>
                <p className="text-xs text-slate-500">
                  We&apos;re happy to help clarify anything on this page.
                </p>
              </div>
            </div>
            <a href="mailto:support@billflow.app">
              <Button className="whitespace-nowrap text-sm">Contact support</Button>
            </a>
          </div>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </article>
      </div>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-5 text-xs text-slate-400 sm:flex-row md:px-8">
        <span>© 2026 Billflow · Built by TemiForge Studio</span>
        <div className="flex gap-4 text-slate-500">
          <Link to="/privacy" className="hover:text-slate-900">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-900">Terms</Link>
          <a href="mailto:hello@billflow.app" className="hover:text-slate-900">Contact</a>
        </div>
      </footer>
    </div>
  )
}

interface LegalSectionProps {
  id: string
  index: number
  title: string
  children: ReactNode
}

/**
 * A single numbered legal section. Uses scroll-margin so anchor jumps clear
 * the sticky header, and provides consistent typography for the body copy.
 */
export function LegalSection({ id, index, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-brand">
          {index}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 pl-10 text-sm leading-relaxed text-slate-600 [&_a]:font-medium [&_a]:text-brand [&_a:hover]:text-brand-dark [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8em] [&_code]:text-brand">
        {children}
      </div>
    </section>
  )
}

/** Consistent bulleted list styling for legal sections. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
