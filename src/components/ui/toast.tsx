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

// LucasArts point-and-click adventure style podcast humor messages
const getHumorMessage = (type: Toast['type']): string => {
  const messages = {
    success: [
      "🎙️ Achievement unlocked! Your podcast powers have increased.",
      "🏆 Congratulations! You've successfully used PODCAST on INTERNET.",
      "✨ Your microphone glows with a mysterious podcast energy...",
      "🎧 *DING* The universe approves of your audio wizardry!",
      "🚀 Mission accomplished! Your podcast rocket has launched successfully.",
      "🎯 *Click* That worked better than expected! Nice job, audio adventurer.",
      "🌟 The Secret of Podcast Island has been unlocked!",
      "🎮 *Victory fanfare plays* Your podcast quest is progressing smoothly!"
    ],
    error: [
      "💥 Oh no! You can't USE SAVE on BROKEN EPISODE.",
      "🔧 *Error sound* That's not quite right. Try using REPAIR on PODCAST.",
      "⚡ The podcast machine made a concerning buzzing noise...",
      "🚫 I don't think that verb will work in this podcast context.",
      "💻 *Sad computer beep* The podcast spirits are displeased today.",
      "🎭 Plot twist! Something unexpected happened in your audio adventure.",
      "🔥 Warning: Podcast combustion detected! Please try again.",
      "❌ *Record scratch* That didn't go according to the script..."
    ],
    info: [
      "📻 A mysterious podcast message appears in your inventory!",
      "🗣️ *Narrator voice* Meanwhile, in the land of audio content...",
      "🎵 You hear the distant sound of podcast progress being made.",
      "📜 A helpful hint appears on your podcast HUD!",
      "🔔 *Notification chime* The podcast gods have spoken!",
      "💭 You suddenly remember something important about podcasting...",
      "🎪 Breaking news from the Department of Audio Adventures!",
      "📡 Your podcast communication device is receiving a transmission..."
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
    const humorMessage = toast.message.includes('🎙️') || toast.message.includes('🎧') || toast.message.includes('*') 
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
        return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-300'
      case 'error':
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white border-red-400'
      case 'info':
        return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-300'
      default:
        return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-300'
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

  const getBackgroundStyle = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))'
      case 'error':
        return 'linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95))'
      case 'info':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))'
      default:
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))'
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
        background: getBackgroundStyle(toast.type)
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
      
      {/* Toast slice decoration - now red themed */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/30 rounded-full"></div>
    </div>
  )
} 