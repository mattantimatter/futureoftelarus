import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProposalLayout } from '@/components/proposal/ProposalLayout'
import type { ProposalJSON } from '@/lib/seed'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const supabase = createServerClient()
  const { data: proposal } = await supabase
    .from('proposals')
    .select('title, client_name')
    .eq('public_token', token)
    .single()

  if (!proposal) {
    return { title: 'Proposal Not Found' }
  }

  return {
    title: `${proposal.title} — ${proposal.client_name} Proposal`,
    description: 'Interactive enterprise AI deployment proposal powered by ATOM.',
  }
}

export default async function ProposalViewerPage({ params }: PageProps) {
  const { token } = await params

  const supabase = createServerClient()

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (error || !proposal) {
    notFound()
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? null
  const userAgent = headersList.get('user-agent') ?? null

  await supabase.from('audit_events').insert({
    proposal_id: proposal.id,
    event_type: 'VIEW_PROPOSAL',
    event_meta: { source: 'public_link' },
    ip_address: ip,
    user_agent: userAgent,
  })

  const proposalJson = proposal.proposal_json as unknown as ProposalJSON

  let sourcePdfDownloadUrl: string | null = null
  const pdfPath = proposal.source_pdf_path
  if (pdfPath) {
    const { data: urlData } = await supabase.storage.from('proposal_source_pdfs').createSignedUrl(pdfPath, 3600)
    sourcePdfDownloadUrl = urlData?.signedUrl ?? null
  }

  return (
    <ProposalLayout
      proposal={proposal}
      proposalJson={proposalJson}
      sourcePdfDownloadUrl={sourcePdfDownloadUrl}
    />
  )
}
