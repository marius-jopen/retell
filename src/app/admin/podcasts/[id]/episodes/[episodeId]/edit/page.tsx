import { EpisodeEdit } from '@/components/episodes'

export default async function AdminEpisodeEditPage({ 
  params 
}: { 
  params: Promise<{ id: string; episodeId: string }> 
}) {
  // Await params in Next.js 15
  const { id, episodeId } = await params

  return (
    <EpisodeEdit
      podcastId={id}
      episodeId={episodeId}
      isAdmin={true}
      backUrl={`/admin/podcasts/${id}/episodes`}
      successRedirectUrl={`/admin/podcasts/${id}/episodes`}
    />
  )
} 