import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPodcastViewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['admin'])
  
  // Await params in Next.js 15
  const { id } = await params
  
  // Redirect directly to the edit page
  redirect(`/admin/podcasts/${id}/edit`)
} 