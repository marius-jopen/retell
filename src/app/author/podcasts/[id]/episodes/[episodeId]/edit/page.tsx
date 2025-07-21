import { EpisodeEdit } from '@/components/episodes'

export default async function EditEpisodePage({ 
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
      isAdmin={false}
      backUrl={`/author/podcasts/${id}/episodes`}
      successRedirectUrl={`/author/podcasts/${id}/episodes`}
    />
  )
} 