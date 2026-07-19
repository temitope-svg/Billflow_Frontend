import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { LogoBrand } from '../components/BillflowLogo'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { DocumentHtmlPreview } from '../components/documents/DocumentPreview'
import { getPublicDocumentBySlug } from '../services/documents'
import { buildDocumentHtml, downloadDocumentHtmlAsPdf } from '../services/documentHtml'
import type { DocumentWithDetails } from '../types/database'

export default function PublicDocumentPage() {
  const { slug } = useParams<{ slug: string }>()
  const [doc, setDoc] = useState<DocumentWithDetails | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!slug) return
    getPublicDocumentBySlug(slug).then(({ data, error }) => {
      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const loaded = data as unknown as DocumentWithDetails
      setDoc(loaded)
      setHtml(buildDocumentHtml(loaded))
      setLoading(false)
    })
  }, [slug])

  const handleDownload = async () => {
    if (!html || !doc) return
    setDownloading(true)
    try {
      await downloadDocumentHtmlAsPdf(html, doc.document_number)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="flex min-h-svh items-center justify-center"><PageLoader /></div>
  if (notFound || !doc) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-slate-100 p-6 text-center">
        <h1 className="text-lg font-semibold">Document not found</h1>
        <p className="text-sm text-slate-500">This link may have expired or been made private.</p>
        <Link to="/"><Button>Go to Billflow</Button></Link>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <LogoBrand className="text-sm" />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs"
            disabled={downloading}
            onClick={() => void handleDownload()}
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
          <Link to="/register"><Button className="text-xs">Create your own</Button></Link>
        </div>
      </header>

      <div className="px-6 py-8">
        {html ? <DocumentHtmlPreview html={html} /> : <p className="text-center text-slate-400">Could not load document</p>}
      </div>

      <div className="flex justify-center px-6 pb-10">
        <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-semibold">Made with Billflow</p>
            <p className="text-[11px] text-slate-500">Create your own estimates, invoices and receipts free</p>
          </div>
          <Link to="/register"><Button className="text-xs whitespace-nowrap">Try it free</Button></Link>
        </div>
      </div>
    </div>
  )
}
