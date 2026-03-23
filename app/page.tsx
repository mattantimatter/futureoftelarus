/**
 * Root route — renders the full interactive proposal from static seed data.
 */
import { ProposalLayout } from '@/components/proposal/ProposalLayout'
import { defaultProposalJSON } from '@/lib/seed'
import type { Proposal } from '@/lib/supabase/types'

const proposal: Proposal = {
  id: 'telarus-atom',
  title: 'Telarus × Antimatter — ATOM Deployment Proposal',
  client_name: 'Telarus',
  status: 'sent',
  public_token: 'telarus',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proposal_json: defaultProposalJSON as any,
  pricing_json: null,
  source_pdf_path: null,
  signed_pdf_path: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function HomePage() {
  return (
    <ProposalLayout
      proposal={proposal}
      proposalJson={defaultProposalJSON}
    />
  )
}
