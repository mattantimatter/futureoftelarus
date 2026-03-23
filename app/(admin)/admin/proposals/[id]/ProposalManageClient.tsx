'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, ExternalLink, Upload,
  Eye, CheckCircle, Send, RefreshCw, ChevronDown,
  ChevronUp, Trash2, RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { Proposal, AuditEvent } from '@/lib/supabase/types'

interface ProposalManageClientProps {
  proposal: Proposal
  auditEvents: AuditEvent[]
}

const EVENT_ICONS: Record<string, string> = {
  VIEW_PROPOSAL: '👁',
  DOWNLOAD_PDF: '⬇️',
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://futureoftelarus.com'

export function ProposalManageClient({
  proposal,
  auditEvents,
}: ProposalManageClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [auditExpanded, setAuditExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reseeding, setReseeding] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const viewerUrl = `${SITE_URL}/p/${proposal.public_token}`

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast(`${label} copied!`)
  }

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPdf(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('proposalId', proposal.id)
    try {
      const res = await fetch('/api/admin/upload-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) { toast('PDF uploaded!'); router.refresh() }
      else toast(data.error ?? 'Upload failed', 'error')
    } catch { toast('Upload failed', 'error') }
    finally { setUploadingPdf(false) }
  }

  const handleReseed = async () => {
    setReseeding(true)
    try {
      const res = await fetch(`/api/admin/proposals/${proposal.id}/reseed`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast('Proposal content updated with latest seed!')
        router.refresh()
      } else {
        toast(data.error ?? 'Reseed failed', 'error')
      }
    } catch { toast('Reseed failed', 'error') }
    finally { setReseeding(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/proposals/${proposal.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast('Proposal deleted')
        router.push('/admin')
      } else {
        toast(data.error ?? 'Delete failed', 'error')
      }
    } catch { toast('Delete failed', 'error') }
    finally { setDeleting(false) }
  }

  const handleMarkSent = async () => {
    await fetch(`/api/admin/proposals/${proposal.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sent' }),
    })
    toast('Marked as sent!')
    router.refresh()
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/admin" className="mt-1 text-foreground/30 hover:text-foreground/70 transition-colors">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">{proposal.title}</h1>
              <Badge variant={proposal.status === 'sent' ? 'amber' : 'accent'}>
                {proposal.status}
              </Badge>
            </div>
            <p className="text-sm font-light text-foreground/40">{proposal.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={viewerUrl} target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-foreground/[0.08] px-3 py-2 text-xs text-foreground/40 transition-all hover:border-foreground/20 hover:text-foreground">
            <Eye size={13} />Preview
          </Link>
          {proposal.status !== 'sent' && (
            <button onClick={handleMarkSent}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400 transition-all hover:bg-yellow-500/20">
              <Send size={13} />Mark Sent
            </button>
          )}
          <button
            onClick={handleReseed}
            disabled={reseeding}
            title="Refresh proposal content from latest seed (contacts, sections, pricing)"
            className="flex items-center gap-1.5 rounded-lg border border-foreground/[0.08] px-3 py-2 text-xs text-foreground/40 transition-all hover:border-foreground/20 hover:text-foreground disabled:opacity-40"
          >
            <RotateCcw size={13} className={reseeding ? 'animate-spin' : ''} />
            {reseeding ? 'Refreshing...' : 'Refresh Content'}
          </button>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/15 px-3 py-2 text-xs text-red-400/60 transition-all hover:border-red-500/30 hover:text-red-400">
              <Trash2 size={13} />Delete
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
              <span className="text-xs text-red-400">Sure?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs font-semibold text-red-400 hover:text-red-300">
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="text-xs text-foreground/30 hover:text-foreground">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Viewer Link */}
      <div className="mb-5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/35">Viewer Link</span>
          <button onClick={() => copy(viewerUrl, 'Viewer link')}
            className="flex items-center gap-1 text-xs text-foreground/30 hover:text-foreground transition-colors">
            <Copy size={11} />Copy
          </button>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] px-3 py-2 text-xs text-secondary">
            {viewerUrl}
          </code>
          <a href={viewerUrl} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-foreground/[0.08] p-2 text-foreground/30 hover:text-foreground transition-colors">
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {/* Source PDF */}
          <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
            <h2 className="mb-3 font-semibold text-foreground">Source PDF</h2>
            {proposal.source_pdf_path ? (
              <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <CheckCircle size={15} className="text-green-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-green-400">PDF uploaded</p>
                  <code className="block truncate text-xs text-foreground/30">{proposal.source_pdf_path}</code>
                </div>
              </div>
            ) : (
              <p className="mb-3 text-sm font-light text-foreground/40">No source PDF uploaded yet.</p>
            )}
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUploadPdf} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPdf}
              className="flex items-center gap-2 rounded-lg border border-foreground/[0.08] px-4 py-2 text-xs text-foreground/50 transition-all hover:border-foreground/20 hover:text-foreground disabled:opacity-40">
              {uploadingPdf ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploadingPdf ? 'Uploading...' : proposal.source_pdf_path ? 'Replace PDF' : 'Upload PDF'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — Audit trail */}
        <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
          <button
            onClick={() => setAuditExpanded(!auditExpanded)}
            className="flex w-full items-center justify-between"
          >
            <h2 className="font-semibold text-foreground">
              Audit Trail
              <span className="ml-2 text-xs font-normal text-foreground/30">({auditEvents.length} events)</span>
            </h2>
            {auditExpanded ? <ChevronUp size={15} className="text-foreground/30" /> : <ChevronDown size={15} className="text-foreground/30" />}
          </button>

          {auditEvents.length === 0 ? (
            <p className="mt-3 text-sm font-light text-foreground/35">No events yet. Events appear when the proposal is viewed.</p>
          ) : (
            <div className={`mt-4 space-y-2 overflow-y-auto transition-all ${auditExpanded ? 'max-h-[600px]' : 'max-h-64'}`}>
              {auditEvents.map((event) => (
                <div key={event.id}
                  className="flex items-start gap-3 rounded-lg border border-foreground/[0.05] bg-foreground/[0.01] p-3">
                  <span className="text-base leading-none mt-0.5 shrink-0">{EVENT_ICONS[event.event_type] ?? '●'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-secondary">{event.event_type}</code>
                      <span className="shrink-0 text-xs text-foreground/25">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    {event.ip_address && (
                      <p className="mt-0.5 text-xs text-foreground/25">IP: {event.ip_address}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Links Modal */}
      <Modal open={shareModalOpen} onClose={() => setShareModalOpen(false)}
        title="Share Links" description="Copy and send these links to the appropriate recipients." size="lg">
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/35">Viewer Link (Public)</p>
            <div className="flex gap-2">
              <code className="flex-1 truncate rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2.5 text-xs text-secondary">
                {viewerUrl}
              </code>
              <button onClick={() => copy(viewerUrl, 'Viewer link')}
                className="flex items-center gap-1.5 rounded-xl border border-foreground/[0.08] px-3 py-2 text-xs text-foreground/40 transition-all hover:text-foreground">
                <Copy size={11} />Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
