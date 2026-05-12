import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from '@storybook/test'
import { ToastProvider, useToast } from './ToastProvider'

// --- Story harness components ---
// These small components exist only in this file. They're not part of
// the library — they're scaffolding so stories can call useToast().
// This is the standard pattern for "stories that need to trigger behavior".

function AddToastButton({ label, variant, message }: {
  label: string
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string
}) {
  const { add } = useToast()
  return (
    <button
      type="button"
      onClick={() => add({ variant, message })}
      className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700"
    >
      {label}
    </button>
  )
}

function ToastDemo() {
  const { add } = useToast()
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <button
        type="button"
        onClick={() => add({ variant: 'success', message: 'Changes saved!' })}
        className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
      >
        Success
      </button>
      <button
        type="button"
        onClick={() => add({ variant: 'error', message: 'Something went wrong.' })}
        className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
      >
        Error
      </button>
      <button
        type="button"
        onClick={() => add({ variant: 'warning', message: 'Storage is almost full.' })}
        className="rounded-md bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600"
      >
        Warning
      </button>
      <button
        type="button"
        onClick={() => add({ variant: 'info', message: 'Update available.' })}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
      >
        Info
      </button>
    </div>
  )
}

// --- Meta ---
// We use Meta<typeof ToastDemo> (a harness component) rather than
// Meta<typeof ToastProvider> because our stories render demo wrappers,
// not the provider itself. This is idiomatic when the component under
// documentation is a context provider rather than a UI component.

const meta = {
  title: 'Components/ToastProvider',
  component: ToastDemo,
  decorators: [
    // DECORATOR: wraps every story in this file with ToastProvider.
    // This is the canonical Storybook pattern for context providers.
    // Without this, any story that calls useToast() would throw.
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ToastDemo>

export default meta
type Story = StoryObj<typeof meta>

// --- Stories ---

export const Interactive: Story = {
  render: () => <ToastDemo />,
}

export const Stacked: Story = {
  render: () => (
    <AddToastButton label="Add toast" variant="info" message="Toast added" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn = canvas.getByRole('button', { name: /add toast/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)
  },
}

export const ManualDismissal: Story = {
  render: () => (
    <AddToastButton label="Show toast" variant="success" message="Click × to dismiss me" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /show toast/i }))

    // waitFor is needed because the toast appears after a React state update,
    // not synchronously — the play function runs immediately after render.
    const dismissBtn = await waitFor(() =>
      canvas.getByRole('button', { name: /dismiss/i })
    )

    await userEvent.click(dismissBtn)

    await waitFor(() => {
      expect(canvas.queryByRole('button', { name: /dismiss/i })).toBeNull()
    })
  },
}

export const AutoDismiss: Story = {
  parameters: {
    // This story tests time-based behavior (a 1s auto-dismiss timer).
    // Chromatic snapshots are point-in-time — they can't reliably capture
    // "component is gone after N ms" without flakiness. Disabling the snapshot
    // here is idiomatic: keep the story for local dev/docs, skip it in CI.
    chromatic: { disableSnapshot: true },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { add } = useToast()
    return (
      <button
        type="button"
        onClick={() => add({ variant: 'info', message: 'I will disappear in 1 second', duration: 1000 })}
        className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
      >
        Show auto-dismiss toast (1s)
      </button>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /show auto-dismiss/i }))

    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
    )

    await waitFor(
      () => expect(canvas.queryByRole('button', { name: /dismiss/i })).toBeNull(),
      { timeout: 2000 }
    )
  },
}

export const HookAPI: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { add, dismiss } = useToast()
    return (
      <div className="flex gap-2 p-4">
        <button
          type="button"
          onClick={() => add({ variant: 'success', message: 'Added via hook' })}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
        >
          add()
        </button>
        <button
          type="button"
          onClick={() => dismiss('nonexistent-id')}
          className="rounded-md bg-gray-500 px-3 py-2 text-sm text-white"
        >
          dismiss() no-op
        </button>
      </div>
    )
  },
}
