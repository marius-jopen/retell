import { createServerSupabaseClient } from '@/lib/supabase'

export type PodcastWorkflowMode = 'manual' | 'rss' | 'hybrid'

export interface PodcastWorkflowState {
  mode: PodcastWorkflowMode
  rss_url: string | null
  rss_sync_enabled: boolean
  manual_overrides: {
    title?: boolean
    description?: boolean
    cover_image?: boolean
    category?: boolean
    language?: boolean
    country?: boolean
  }
  last_rss_sync: string | null
  rss_image_url: string | null
}

export interface WorkflowTransition {
  from: PodcastWorkflowMode
  to: PodcastWorkflowMode
  preserveData: boolean
  syncRSS: boolean
}

/**
 * Get the current workflow state of a podcast
 */
export async function getPodcastWorkflowState(podcastId: string): Promise<PodcastWorkflowState | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcast, error } = await supabase
    .from('podcasts')
    .select('rss_url, rss_sync_enabled, manual_overrides, last_rss_sync, rss_image_url')
    .eq('id', podcastId)
    .single()

  if (error || !podcast) {
    return null
  }

  // Determine current mode
  let mode: PodcastWorkflowMode = 'manual'
  if (podcast.rss_url) {
    if (podcast.rss_sync_enabled) {
      mode = podcast.manual_overrides && Object.keys(podcast.manual_overrides).length > 0 ? 'hybrid' : 'rss'
    } else {
      mode = 'hybrid' // RSS URL present but sync disabled
    }
  }

  return {
    mode,
    rss_url: podcast.rss_url,
    rss_sync_enabled: podcast.rss_sync_enabled || false,
    manual_overrides: podcast.manual_overrides || {},
    last_rss_sync: podcast.last_rss_sync,
    rss_image_url: podcast.rss_image_url
  }
}

/**
 * Transition a podcast between workflow modes
 */
export async function transitionPodcastWorkflow(
  podcastId: string,
  transition: WorkflowTransition,
  options: {
    rss_url?: string
    sync_now?: boolean
    preserve_manual_changes?: boolean
  } = {}
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  try {
    const currentState = await getPodcastWorkflowState(podcastId)
    if (!currentState) {
      return { success: false, error: 'Podcast not found' }
    }

    if (currentState.mode !== transition.from) {
      return { success: false, error: `Invalid transition: podcast is in ${currentState.mode} mode, not ${transition.from}` }
    }

    const updates: any = {}

    switch (transition.to) {
      case 'manual':
        // Transition to manual mode
        updates.rss_sync_enabled = false
        updates.manual_overrides = {}
        if (!options.preserve_manual_changes) {
          updates.rss_url = null
          updates.rss_image_url = null
        }
        break

      case 'rss':
        // Transition to RSS mode
        if (!options.rss_url && !currentState.rss_url) {
          return { success: false, error: 'RSS URL is required for RSS mode' }
        }
        updates.rss_url = options.rss_url || currentState.rss_url
        updates.rss_sync_enabled = true
        updates.manual_overrides = {}
        if (options.sync_now) {
          updates.last_rss_sync = new Date().toISOString()
        }
        break

      case 'hybrid':
        // Transition to hybrid mode
        if (!options.rss_url && !currentState.rss_url) {
          return { success: false, error: 'RSS URL is required for hybrid mode' }
        }
        updates.rss_url = options.rss_url || currentState.rss_url
        updates.rss_sync_enabled = true
        // Preserve existing manual overrides
        if (!currentState.manual_overrides) {
          updates.manual_overrides = {}
        }
        break
    }

    updates.updated_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('podcasts')
      .update(updates)
      .eq('id', podcastId)

    if (updateError) {
      return { success: false, error: `Failed to update podcast: ${updateError.message}` }
    }

    return { success: true }

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Set a manual override for a specific field
 */
export async function setManualOverride(
  podcastId: string,
  field: keyof PodcastWorkflowState['manual_overrides'],
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  try {
    const currentState = await getPodcastWorkflowState(podcastId)
    if (!currentState) {
      return { success: false, error: 'Podcast not found' }
    }

    const overrides = { ...currentState.manual_overrides, [field]: value }
    
    const { error: updateError } = await supabase
      .from('podcasts')
      .update({ 
        manual_overrides: overrides,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcastId)

    if (updateError) {
      return { success: false, error: `Failed to update override: ${updateError.message}` }
    }

    return { success: true }

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Check if a field is manually overridden
 */
export function isFieldOverridden(
  workflowState: PodcastWorkflowState,
  field: keyof PodcastWorkflowState['manual_overrides']
): boolean {
  return workflowState.manual_overrides[field] === true
}

/**
 * Get available workflow transitions for a podcast
 */
export function getAvailableTransitions(currentMode: PodcastWorkflowMode): WorkflowTransition[] {
  const transitions: WorkflowTransition[] = []

  switch (currentMode) {
    case 'manual':
      transitions.push(
        { from: 'manual', to: 'rss', preserveData: false, syncRSS: true },
        { from: 'manual', to: 'hybrid', preserveData: true, syncRSS: true }
      )
      break

    case 'rss':
      transitions.push(
        { from: 'rss', to: 'manual', preserveData: false, syncRSS: false },
        { from: 'rss', to: 'hybrid', preserveData: true, syncRSS: true }
      )
      break

    case 'hybrid':
      transitions.push(
        { from: 'hybrid', to: 'manual', preserveData: false, syncRSS: false },
        { from: 'hybrid', to: 'rss', preserveData: false, syncRSS: true }
      )
      break
  }

  return transitions
}

/**
 * Get workflow mode description
 */
export function getWorkflowModeDescription(mode: PodcastWorkflowMode): string {
  switch (mode) {
    case 'manual':
      return 'Manual mode: All podcast data is managed manually'
    case 'rss':
      return 'RSS mode: Podcast data is automatically synced from RSS feed'
    case 'hybrid':
      return 'Hybrid mode: RSS sync with manual overrides for specific fields'
    default:
      return 'Unknown mode'
  }
}

/**
 * Validate workflow transition
 */
export function validateWorkflowTransition(
  from: PodcastWorkflowMode,
  to: PodcastWorkflowMode,
  options: { rss_url?: string } = {}
): { valid: boolean; error?: string } {
  if (from === to) {
    return { valid: false, error: 'Cannot transition to the same mode' }
  }

  if ((to === 'rss' || to === 'hybrid') && !options.rss_url) {
    return { valid: false, error: 'RSS URL is required for RSS and hybrid modes' }
  }

  const availableTransitions = getAvailableTransitions(from)
  const isValidTransition = availableTransitions.some(t => t.to === to)
  
  if (!isValidTransition) {
    return { valid: false, error: `Invalid transition from ${from} to ${to}` }
  }

  return { valid: true }
} 