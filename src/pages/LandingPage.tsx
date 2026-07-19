import { Link } from 'react-router-dom'
import {
  FileText,
  Monitor,
  Share2,
  PenLine,
  LayoutTemplate,
  BarChart3,
  ArrowRight,
  Globe,
  Copy,
} from 'lucide-react'
import { LogoBrand } from '../components/BillflowLogo'
import { Button } from '../components/ui/Button'

const features = [
  {
    icon: FileText,
    title: 'Three document types',
    desc: 'Estimates, invoices, and receipts. Convert between them in one click — data carries over automatically.',
  },
  {
    icon: Monitor,
    title: 'Web and mobile',
    desc: 'Same account everywhere. Create on your phone, review on desktop. Real-time sync.',
  },
  {
    icon: Share2,
    title: 'Share anywhere',
    desc: 'WhatsApp, Gmail, download, or a public link. Share the PDF with your client.',
  },
  {
    icon: PenLine,
    title: 'Signature support',
    desc: 'Draw or upload once. Auto-stamps on every document. Toggle off per document anytime.',
  },
  {
    icon: LayoutTemplate,
    title: 'Professional templates',
    desc: 'Multiple design styles per document type. Your logo on every document.',
  },
  {
    icon: BarChart3,
    title: 'Track everything',
    desc: 'Paid, overdue, and sent at a glance. Filter by type and search by client.',
  },
]

const steps = [
  ['Set up your profile', 'Business name, logo, address, bank details. Auto-fills every document.'],
  ['Pick a template', 'Minimal, bold, or classic — different styles per document type.'],
  ['Fill in the details', 'Client info, line items, VAT, discounts. Preview before saving.'],
  ['Share the PDF', 'WhatsApp, Gmail, download, or a public link.'],
]

const industries = ['Design', 'Development', 'Photography', 'Consulting', 'Construction', 'Events']

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-8 py-3">
        <LogoBrand />
        <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#how" className="hover:text-slate-900">How it works</a>
          <a href="#public" className="hover:text-slate-900">Public sharing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link to="/onboarding">
            <Button>Get started free</Button>
          </Link>
        </div>
      </header>

      <section className="px-8 py-16 text-center">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          Invoicing for freelancers &amp; small businesses
        </p>
        <h1 className="mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Create estimates, invoices and receipts — in seconds
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
          Billflow handles your full billing flow from quote to receipt. Download PDFs, share via
          WhatsApp or Gmail, or send a public link. Web and mobile.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/onboarding">
            <Button className="px-6 py-2.5">Start for free</Button>
          </Link>
          <a href="#how">
            <Button variant="outline" className="px-6 py-2.5">See how it works</Button>
          </a>
        </div>

        <div className="mx-auto mt-10 max-w-lg overflow-hidden rounded-xl border border-slate-200 text-left shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2">
            <span className="text-[10px] text-slate-400">INV-042 · Kemi Styles</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-800">
              <Globe className="h-2.5 w-2.5" /> Public
            </span>
          </div>
          <div className="p-4 text-[10px]">
            <div className="mb-3 flex justify-between">
              <div>
                <div className="mb-1 h-6 w-6 rounded bg-brand" />
                <div className="font-semibold">TemiForge Studio</div>
                <div className="text-slate-400">Lagos, Nigeria</div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-medium text-indigo-800">Invoice</span>
                <div className="text-slate-500">INV-042 · Jun 6, 2026</div>
              </div>
            </div>
            <p className="text-slate-400">Bill to: <strong className="text-slate-900">Kemi Styles</strong></p>
            <table className="mt-2 w-full">
              <tbody>
                <tr className="border-b border-slate-100 text-slate-500">
                  <td className="py-1">UI Design — 3 screens</td>
                  <td className="text-center">2 hrs</td>
                  <td className="text-right text-slate-900">₦50,000</td>
                </tr>
                <tr className="text-slate-500">
                  <td className="py-1">Dev handoff</td>
                  <td className="text-center">1 hr</td>
                  <td className="text-right text-slate-900">₦25,000</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 flex justify-end">
              <div className="min-w-[140px] text-[10px]">
                <div className="flex justify-between text-slate-500"><span>Total</span><span className="font-semibold text-brand">₦80,625</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-5 border-y border-slate-200 bg-slate-50 px-8 py-3 text-xs text-slate-500">
        <span className="text-slate-400">Used by freelancers in</span>
        {industries.map((i) => (
          <span key={i} className="font-medium">{i}</span>
        ))}
      </div>

      <section id="features" className="px-8 py-14">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">Everything you need</p>
        <h2 className="mt-2 text-xl font-semibold">Built for how you actually work</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50">
                <Icon className="h-4 w-4 text-brand" />
              </div>
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-slate-200 bg-slate-50 px-8 py-14">
        <p className="text-center text-xs font-semibold tracking-widest text-brand uppercase">How it works</p>
        <h2 className="mt-2 text-center text-xl font-semibold">From quote to receipt in minutes</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, desc], i) => (
            <div key={title} className="relative text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-brand">
                {i + 1}
              </div>
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute top-4 -right-4 hidden h-4 w-4 text-slate-300 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="public" className="px-8 py-14">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">Public documents</p>
        <h2 className="mt-2 text-xl font-semibold">Share a link, not just a file</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Make any document public. Anyone with the link can view it in their browser — no account needed.
        </p>
        <div className="mt-6 flex flex-col gap-6 rounded-xl border border-slate-200 bg-slate-50 p-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h3 className="font-medium">Set a document public, get a shareable link</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Your client gets a clean, professional document page — not an email attachment.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['WhatsApp', 'Gmail', 'Download PDF', 'Copy link'].map((m) => (
                <span key={m} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-500">{m}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[9px] font-medium tracking-wide text-slate-400 uppercase">Shareable link</p>
            <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2">
              <Globe className="h-4 w-4 text-brand" />
              <span className="flex-1 font-mono text-[10px] text-brand">billflow.app/d/INV-042</span>
              <Copy className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-center text-[9px] text-slate-400">Revoke access anytime</p>
          </div>
        </div>
      </section>

      <section className="border-t border-indigo-200 bg-indigo-50 px-8 py-14 text-center">
        <h2 className="text-2xl font-semibold">Start billing professionally today</h2>
        <p className="mt-2 text-sm text-slate-500">Free to use. No credit card needed. Web and mobile.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/onboarding"><Button className="px-6">Create your account</Button></Link>
          <Button variant="outline" className="px-6">Download the app</Button>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-8 py-5 text-xs text-slate-400 sm:flex-row">
        <span>© 2026 Billflow · Built by TemiForge Studio</span>
        <div className="flex gap-4 text-slate-500">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href="mailto:hello@billflow.app">Contact</a>
        </div>
      </footer>
    </div>
  )
}
