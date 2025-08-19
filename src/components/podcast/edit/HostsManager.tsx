'use client'

import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileInput } from '@/components/ui/file-input'
import { useToast } from '@/components/ui/toast'

interface Host {
  id: string
  name: string
  language: string
  image?: File | string
  imagePreviewUrl?: string
}

interface HostsManagerProps {
  hosts: Host[]
  onHostsChange: (hosts: Host[]) => void
  onFileUpload?: (hostId: string, file: File) => void
}

export default function HostsManager({ 
  hosts, 
  onHostsChange, 
  onFileUpload 
}: HostsManagerProps) {
  const { addToast } = useToast()
  const hostFilesRef = useRef<Map<string, File>>(new Map())

  const handleAddHost = () => {
    const newHost: Host = {
      id: Date.now().toString(),
      name: '',
      language: 'en'
    }
    onHostsChange([...hosts, newHost])
  }

  const handleRemoveHost = (hostId: string) => {
    const updatedHosts = hosts.filter(h => h.id !== hostId)
    onHostsChange(updatedHosts)
    
    // Clean up file reference
    hostFilesRef.current.delete(hostId)
  }

  const handleHostChange = (hostId: string, field: keyof Host, value: any) => {
    const updatedHosts = hosts.map(h => 
      h.id === hostId ? { ...h, [field]: value } : h
    )
    onHostsChange(updatedHosts)
  }

  const handleImageUpload = async (hostId: string, file: File) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', message: 'File size must be less than 5MB' })
      return
    }

    // Store file reference
    hostFilesRef.current.set(hostId, file)
    
    // Notify parent component
    if (onFileUpload) {
      onFileUpload(hostId, file)
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      handleHostChange(hostId, 'image', file)
      handleHostChange(hostId, 'imagePreviewUrl', reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (hosts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-900">Hosts</div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleAddHost}
          >
            + Add Host
          </Button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No hosts added yet</p>
          <p className="text-xs mt-1">Click "Add Host" to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-900">Hosts</div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleAddHost}
        >
          + Add Host
        </Button>
      </div>

      <div className="space-y-4">
        {hosts.map((host, index) => (
          <div key={host.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Host {index + 1}</span>
              {hosts.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRemoveHost(host.id)}
                >
                  Remove Host
                </Button>
              )}
            </div>
            
            <FileInput
              label="Host Image"
              id={`host_${host.id}_image`}
              accept="image/*"
              helperText="Upload host photo (max 5MB)"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  handleImageUpload(host.id, file)
                }
              }}
            />
            
            {/* Host Image Preview */}
            {(host.imagePreviewUrl || (typeof host.image === 'string' && host.image)) && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Current host image</div>
                <img
                  src={host.imagePreviewUrl || (typeof host.image === 'string' ? host.image : '')}
                  alt="Host preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}

            <Input
              label="Host Name*"
              id={`host_${host.id}_name`}
              placeholder="Enter host name"
              value={host.name}
              onChange={(e) => handleHostChange(host.id, 'name', e.target.value)}
              required
            />

            <Select
              label="Host Language*"
              id={`host_${host.id}_language`}
              value={host.language}
              onChange={(e) => handleHostChange(host.id, 'language', e.target.value)}
              required
            >
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="it">Italian</option>
              <option value="nl">Dutch</option>
              <option value="pt">Portuguese</option>
              <option value="pl">Polish</option>
              <option value="sv">Swedish</option>
              <option value="da">Danish</option>
              <option value="no">Norwegian</option>
              <option value="fi">Finnish</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="other">Other</option>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}
