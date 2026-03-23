import { notFound } from 'next/navigation'
import { getProposalById } from '@/lib/actions/proposals'
import { createServerClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProposalManageClient } from './ProposalManageClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ManageProposalPage({ params }: PageProps) {
  const { id } = await params

  const proposal = await getProposalById(id)
  if (!proposal) notFound()

  const supabase = createServerClient()

  const { data: auditEvents } = await supabase
    .from('audit_events')
    .select('*')
    .eq('proposal_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <AdminLayout>
      <ProposalManageClient
        proposal={proposal}
        auditEvents={auditEvents ?? []}
      />
    </AdminLayout>
  )
}
