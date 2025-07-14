'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { 
  PodcastWorkflowMode, 
  PodcastWorkflowState, 
  WorkflowTransition, 
  getWorkflowModeDescription 
} from '@/lib/podcast-workflow'

interface PodcastWorkflowManagerProps {
  podcastId: string
  initialWorkflowState?: PodcastWorkflowState
  onWorkflowChanged?: (newState: PodcastWorkflowState) => void
}

export default function PodcastWorkflowManager({ 
  podcastId, 
  initialWorkflowState,
  onWorkflowChanged 
}: PodcastWorkflowManagerProps) {
  const [workflowState, setWorkflowState] = useState<PodcastWorkflowState | null>(initialWorkflowState || null)
  const [availableTransitions, setAvailableTransitions] = useState<WorkflowTransition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTransitionForm, setShowTransitionForm] = useState(false)
  const [transitionData, setTransitionData] = useState({
    to: '' as PodcastWorkflowMode,
    rss_url: '',
    sync_now: false,
    preserve_manual_changes: false
  })
  const { addToast } = useToast()

  // Load workflow state on mount
  useEffect(() => {
    if (!initialWorkflowState) {
      loadWorkflowState()
    }
  }, [podcastId, initialWorkflowState])

  const loadWorkflowState = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/podcasts/${podcastId}/workflow`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load workflow state')
      }
      
      setWorkflowState(data.workflow)
      setAvailableTransitions(data.availableTransitions)
    } catch (error) {
      console.error('Error loading workflow state:', error)
      setError(error instanceof Error ? error.message : 'Failed to load workflow state')
    } finally {
      setLoading(false)
    }
  }

  const handleTransition = async () => {
    if (!transitionData.to || !workflowState) return
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/podcasts/${podcastId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transition',
          ...transitionData
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to transition workflow')
      }
      
      setWorkflowState(data.workflow)
      setAvailableTransitions(data.availableTransitions)
      setShowTransitionForm(false)
      setTransitionData({
        to: '' as PodcastWorkflowMode,
        rss_url: '',
        sync_now: false,
        preserve_manual_changes: false
      })
      
      addToast({
        type: 'success',
        message: data.message
      })
      
      if (onWorkflowChanged) {
        onWorkflowChanged(data.workflow)
      }
      
    } catch (error) {
      console.error('Error transitioning workflow:', error)
      setError(error instanceof Error ? error.message : 'Failed to transition workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldOverride = async (field: string, value: boolean) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/podcasts/${podcastId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setOverride',
          field,
          value
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set override')
      }
      
      setWorkflowState(data.workflow)
      
      addToast({
        type: 'success',
        message: data.message
      })
      
      if (onWorkflowChanged) {
        onWorkflowChanged(data.workflow)
      }
      
    } catch (error) {
      console.error('Error setting override:', error)
      setError(error instanceof Error ? error.message : 'Failed to set override')
    } finally {
      setLoading(false)
    }
  }

  const getModeIcon = (mode: PodcastWorkflowMode) => {
    switch (mode) {
      case 'manual': return '✏️'
      case 'rss': return '📡'
      case 'hybrid': return '🔄'
      default: return '❓'
    }
  }

  const getModeColor = (mode: PodcastWorkflowMode) => {
    switch (mode) {
      case 'manual': return 'bg-blue-100 text-blue-800'
      case 'rss': return 'bg-green-100 text-green-800'
      case 'hybrid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !workflowState) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!workflowState) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load workflow state</h3>
          <p className="text-gray-600 mb-4">{error || 'Unknown error'}</p>
          <Button onClick={loadWorkflowState} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔧 Podcast Workflow Management
        </h3>
        <p className="text-gray-600">
          Control how your podcast content is managed and synchronized
        </p>
      </div>

      {/* Current Mode */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Current Mode</h4>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getModeColor(workflowState.mode)}`}>
            {getModeIcon(workflowState.mode)} {workflowState.mode.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {getWorkflowModeDescription(workflowState.mode)}
        </p>
        
        {/* Mode-specific details */}
        {workflowState.mode === 'rss' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>RSS URL:</strong> {workflowState.rss_url || 'Not set'}
            </p>
            {workflowState.last_rss_sync && (
              <p className="text-sm text-green-800 mt-1">
                <strong>Last sync:</strong> {new Date(workflowState.last_rss_sync).toLocaleString()}
              </p>
            )}
          </div>
        )}
        
        {workflowState.mode === 'hybrid' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800 mb-2">
              <strong>RSS URL:</strong> {workflowState.rss_url || 'Not set'}
            </p>
            <p className="text-sm text-purple-800 mb-2">
              <strong>Manual Overrides:</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(workflowState.manual_overrides).map(([field, isOverridden]) => (
                <span
                  key={field}
                  className={`px-2 py-1 rounded-full text-xs ${
                    isOverridden 
                      ? 'bg-purple-200 text-purple-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {field}: {isOverridden ? 'Manual' : 'RSS'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Overrides (for hybrid mode) */}
      {workflowState.mode === 'hybrid' && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Field Overrides</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(workflowState.manual_overrides).map(([field, isOverridden]) => (
              <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {field.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {isOverridden ? 'Manual' : 'RSS'}
                  </span>
                  <button
                    onClick={() => handleFieldOverride(field, !isOverridden)}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      isOverridden 
                        ? 'bg-purple-600' 
                        : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isOverridden ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Transitions */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Available Transitions</h4>
        <div className="grid grid-cols-1 gap-3">
          {availableTransitions.map((transition) => (
            <div
              key={`${transition.from}-${transition.to}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Switch to {getModeIcon(transition.to)} {transition.to.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500">
                  {getWorkflowModeDescription(transition.to)}
                </p>
              </div>
              <Button
                onClick={() => {
                  setTransitionData({ ...transitionData, to: transition.to })
                  setShowTransitionForm(true)
                }}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Switch
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Transition Form */}
      {showTransitionForm && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Transition to {getModeIcon(transitionData.to)} {transitionData.to.toUpperCase()}
          </h4>
          
          {(transitionData.to === 'rss' || transitionData.to === 'hybrid') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RSS Feed URL
              </label>
              <input
                type="url"
                value={transitionData.rss_url}
                onChange={(e) => setTransitionData({ ...transitionData, rss_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-podcast-feed.com/rss"
                required
              />
            </div>
          )}
          
          <div className="mb-4 space-y-2">
            {transitionData.to === 'rss' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={transitionData.sync_now}
                  onChange={(e) => setTransitionData({ ...transitionData, sync_now: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Sync RSS feed immediately</span>
              </label>
            )}
            
            {transitionData.to === 'manual' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={transitionData.preserve_manual_changes}
                  onChange={(e) => setTransitionData({ ...transitionData, preserve_manual_changes: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Preserve manual changes</span>
              </label>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowTransitionForm(false)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransition}
              disabled={loading || (!transitionData.rss_url && (transitionData.to === 'rss' || transitionData.to === 'hybrid'))}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              {loading ? 'Transitioning...' : 'Confirm Transition'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 