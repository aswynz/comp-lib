import type { ReactNode } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  message: string
  variant: ToastVariant
  /** Replaces the default variant icon. Pass false to hide the icon entirely. */
  icon?: ReactNode | false
  /** If provided, renders an action button inside the toast. */
  action?: {
    label: string
    onClick: () => void
  }
  /** If true, renders a dismiss (×) button. */
  dismissible?: boolean
  /** Called when the dismiss button is clicked. */
  onDismiss?: () => void
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-50 border-green-500 text-green-800',
  error:   'bg-red-50 border-red-500 text-red-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  info:    'bg-blue-50 border-blue-500 text-blue-800',
}

const variantActionStyles: Record<ToastVariant, string> = {
  success: 'text-green-700 hover:text-green-900',
  error:   'text-red-700 hover:text-red-900',
  warning: 'text-yellow-700 hover:text-yellow-900',
  info:    'text-blue-700 hover:text-blue-900',
}

const defaultIcons: Record<ToastVariant, ReactNode> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

export function Toast({
  message,
  variant,
  icon,
  action,
  dismissible = false,
  onDismiss,
}: ToastProps) {
  const resolvedIcon = icon === false ? null : (icon ?? defaultIcons[variant])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-md border-l-4 px-4 py-3 shadow-sm ${variantStyles[variant]}`}
    >
      {resolvedIcon !== null && (
        <span aria-hidden="true" className="shrink-0 text-lg leading-none">
          {resolvedIcon}
        </span>
      )}

      <span className="flex-1 text-sm font-medium">{message}</span>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`shrink-0 text-sm font-semibold underline underline-offset-2 ${variantActionStyles[variant]}`}
        >
          {action.label}
        </button>
      )}

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="shrink-0 text-sm opacity-50 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
