import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { 
  getPodcastWorkflowState, 
  transitionPodcastWorkflow, 
  setManualOverride,
  getAvailableTransitions,
  validateWorkflowTransition,
  PodcastWorkflowMode
} from '@/lib/podcast-workflow'

// GET /api/podcasts/[id]/workflow - Get current workflow state
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createServerSupabaseClient()
    
    // Verify podcast ownership
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('id, title, author_id')
      .eq('id', id)
      .single()

    if (podcastError || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
    }

    // Check permissions
    if (user.profile.role !== 'admin' && podcast.author_id !== user.profile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const workflowState = await getPodcastWorkflowState(id)
    if (!workflowState) {
      return NextResponse.json({ error: 'Failed to get workflow state' }, { status: 500 })
    }

    const availableTransitions = getAvailableTransitions(workflowState.mode)

    return NextResponse.json({
      success: true,
      workflow: workflowState,
      availableTransitions
    })

  } catch (error) {
    console.error('Workflow GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/podcasts/[id]/workflow - Transition workflow or set overrides
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, ...actionData } = body

    const supabase = await createServerSupabaseClient()
    
    // Verify podcast ownership
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('id, title, author_id')
      .eq('id', id)
      .single()

    if (podcastError || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
    }

    // Check permissions
    if (user.profile.role !== 'admin' && podcast.author_id !== user.profile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    switch (action) {
      case 'transition':
        return await handleWorkflowTransition(id, actionData)
      case 'setOverride':
        return await handleSetOverride(id, actionData)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Workflow POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleWorkflowTransition(podcastId: string, data: { to: string; rss_url?: string; sync_now?: boolean; preserve_manual_changes?: boolean }) {
  const { to, rss_url, sync_now, preserve_manual_changes } = data

  if (!to) {
    return NextResponse.json({ error: 'Target workflow mode is required' }, { status: 400 })
  }

  // Get current state
  const currentState = await getPodcastWorkflowState(podcastId)
  if (!currentState) {
    return NextResponse.json({ error: 'Failed to get current workflow state' }, { status: 500 })
  }

  // Validate transition
  const validation = validateWorkflowTransition(currentState.mode, to as PodcastWorkflowMode, { rss_url })
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  // Perform transition
  const transition = {
    from: currentState.mode,
    to: to as PodcastWorkflowMode,
    preserveData: preserve_manual_changes || false,
    syncRSS: to === 'rss' || to === 'hybrid'
  }

  const result = await transitionPodcastWorkflow(podcastId, transition, {
    rss_url,
    sync_now,
    preserve_manual_changes
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // Get updated state
  const updatedState = await getPodcastWorkflowState(podcastId)
  
  return NextResponse.json({
    success: true,
    message: `Workflow transitioned from ${currentState.mode} to ${to}`,
    workflow: updatedState,
    availableTransitions: getAvailableTransitions(to as PodcastWorkflowMode)
  })
}

async function handleSetOverride(podcastId: string, data: any) {
  const { field, value } = data

  if (!field || typeof value !== 'boolean') {
    return NextResponse.json({ error: 'Field and boolean value are required' }, { status: 400 })
  }

  const validFields = ['title', 'description', 'cover_image', 'category', 'language', 'country']
  if (!validFields.includes(field)) {
    return NextResponse.json({ error: 'Invalid field name' }, { status: 400 })
  }

  const result = await setManualOverride(podcastId, field, value)
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // Get updated state
  const updatedState = await getPodcastWorkflowState(podcastId)
  
  return NextResponse.json({
    success: true,
    message: `Override for ${field} set to ${value}`,
    workflow: updatedState
  })
} 