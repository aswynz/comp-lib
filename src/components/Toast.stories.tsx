import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from '@storybook/test'
import { Toast } from './Toast'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Visual style and semantic meaning of the toast.',
    },
    icon: {
      control: 'text',
      description: 'Override the default icon. Set to false to hide it.',
    },
    dismissible: {
      control: 'boolean',
    },
    action: {
      control: false,
      description: 'Optional action button: { label: string, onClick: () => void }',
    },
    onDismiss: {
      action: 'dismissed',
    },
  },
  args: {
    message: 'This is a notification message.',
    onDismiss: fn(),
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: { variant: 'success', message: 'Your changes have been saved.' },
}

export const Error: Story = {
  args: { variant: 'error', message: 'Something went wrong. Please try again.' },
}

export const Warning: Story = {
  args: { variant: 'warning', message: 'Your session will expire in 5 minutes.' },
}

export const Info: Story = {
  args: { variant: 'info', message: 'A new version is available.' },
}

export const WithActionButton: Story = {
  args: {
    variant: 'info',
    message: 'A new version is available.',
    action: {
      label: 'Update now',
      onClick: fn(),
    },
  },
}

export const Dismissible: Story = {
  args: {
    variant: 'success',
    message: 'File uploaded successfully.',
    dismissible: true,
  },
}

export const NoIcon: Story = {
  args: {
    variant: 'warning',
    message: 'Storage is almost full.',
    icon: false,
  },
}

export const CustomIcon: Story = {
  args: {
    variant: 'info',
    message: 'Syncing with cloud storage…',
    icon: '☁️',
  },
}

export const ActionButtonClicked: Story = {
  args: {
    variant: 'info',
    message: 'A new version is available.',
    action: {
      label: 'Update now',
      onClick: fn(),
    },
  },
  // play is typed by StoryObj — no annotations needed here
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const actionBtn = canvas.getByRole('button', { name: /update now/i })
    await userEvent.click(actionBtn)
    expect(args.action?.onClick).toHaveBeenCalledTimes(1)
  },
}

export const DismissButtonClicked: Story = {
  args: {
    variant: 'success',
    message: 'File uploaded successfully.',
    dismissible: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const dismissBtn = canvas.getByRole('button', { name: /dismiss/i })
    await userEvent.click(dismissBtn)
    expect(args.onDismiss).toHaveBeenCalledTimes(1)
  },
}
