'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction = 
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }

const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
} | null>(null)

// Monkey Island-style podcast humor messages
const getHumorMessage = (type: Toast['type']): string => {
  const messages = {
    success: [
      "🎙️ Ahoy! Your podcast be sailing smooth waters, matey!",
      "🏴‍☠️ Arrr! That be a fine piece of audio treasure!",
      "🎧 Your listeners be cheering from the crow's nest!",
      "⚓ Success! Even the ship's parrot be applauding!",
      "🗺️ Navigation successful! X marks the spot of great content!",
      "🦜 Polly says: 'That be some mighty fine podcasting!'"
    ],
    error: [
      "💥 Blimey! Seems we've hit a reef in the audio seas!",
      "🔥 Shiver me timbers! The podcast ship needs repairs!",
      "🌊 Batten down the hatches! We've got a storm brewing!",
      "💣 Yo ho ho! The audio cannon misfired!",
      "🚫 Curse the scallywags! Something went awry!",
      "⚠️ All hands on deck! The podcast ship be taking water!"
    ],
    info: [
      "📻 Ahoy there! The radio waves carry news!",
      "🗣️ Hear ye, hear ye! The town crier has word!",
      "🎵 The ship's musician has a tune to share!",
      "📜 A message in a bottle has washed ashore!",
      "🔔 The ship's bell rings with tidings!",
      "🎪 Gather 'round the campfire for a tale!"
    ]
  }
  
  const typeMessages = messages[type]
  return typeMessages[Math.floor(Math.random() * typeMessages.length)]
}

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast]
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.id)
      }
    default:
      return state
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    // Add humor message if not already present
    const humorMessage = toast.message.includes('🎙️') || toast.message.includes('🏴‍☠️') 
      ? toast.message 
      : getHumorMessage(toast.type)
    
    dispatch({ type: 'ADD_TOAST', toast: { ...toast, id, message: humorMessage } })
    
    // Auto-remove after duration
    const duration = toast.duration || 6000 // Slightly longer for reading humor
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', id })
    }, duration)
  }

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={state.toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 space-y-3 max-w-md w-full px-4">
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={() => removeToast(toast.id)}
          index={index}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: () => void
  index: number
}

function ToastItem({ toast, onRemove, index }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove()
    }, toast.duration || 6000)

    return () => clearTimeout(timer)
  }, [toast.duration, onRemove])

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white border-green-300'
      case 'error':
        return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-300'
      case 'info':
        return 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white border-blue-300'
      default:
        return 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white border-gray-300'
    }
  }

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`
        w-full shadow-2xl rounded-2xl border-2 p-4 
        ${getToastStyles(toast.type)} 
        animate-in slide-in-from-bottom-full duration-500 
        hover:scale-105 transition-all
        backdrop-blur-sm
      `}
      style={{
        animationDelay: `${index * 100}ms`,
        background: `linear-gradient(135deg, ${toast.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(59, 130, 246, 0.95)'}, ${toast.type === 'success' ? 'rgba(22, 163, 74, 0.95)' : toast.type === 'error' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(37, 99, 235, 0.95)'})`
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(toast.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed pr-2">
            {toast.message}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onRemove}
            className="inline-flex rounded-full p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Toast slice decoration */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/30 rounded-full"></div>
    </div>
  )
} 