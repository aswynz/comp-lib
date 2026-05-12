import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Toast, type ToastVariant } from './Toast'

// --- Types ---

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  /** How long (ms) before auto-dismiss. 0 = never. Default: 4000 */
  duration?: number
}

interface ToastContextValue {
  add: (toast: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

// --- Context ---

const ToastContext = createContext<ToastContextValue | null>(null)

// --- Provider ---

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  // useRef so the timers map is stable across renders
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const add = useCallback((toast: Omit<ToastItem, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const duration = toast.duration ?? 4000

    setToasts(prev => [...prev, { ...toast, id, duration }])

    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    }

    return id
  }, [dismiss])

  // Clean up all timers on unmount
  useEffect(() => {
    const t = timers.current
    return () => t.forEach(timer => clearTimeout(timer))
  }, [])

  return (
    <ToastContext.Provider value={{ add, dismiss }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// --- Hook ---

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// --- Stack (internal) ---
// Renders the live queue in a fixed overlay. Not exported — consumers
// never place this themselves; it's managed by the provider.

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80"
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          dismissible
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}
