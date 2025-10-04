import type { Meta, StoryObj } from '@storybook/react';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { useState, useEffect } from 'react';

const meta: Meta<typeof SaveStatusIndicator> = {
  title: 'Drawing/SaveStatusIndicator',
  component: SaveStatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'checking', 'saving', 'saved', 'no-changes', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SaveStatusIndicator>;

export const Idle: Story = {
  args: {
    status: 'idle',
  },
};

export const Checking: Story = {
  args: {
    status: 'checking',
  },
};

export const Saving: Story = {
  args: {
    status: 'saving',
  },
};

export const Saved: Story = {
  args: {
    status: 'saved',
  },
};

export const NoChanges: Story = {
  args: {
    status: 'no-changes',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <SaveStatusIndicator status="checking" />
      <SaveStatusIndicator status="saving" />
      <SaveStatusIndicator status="saved" />
      <SaveStatusIndicator status="no-changes" />
      <SaveStatusIndicator status="error" />
    </div>
  ),
};

export const AutoCycle: Story = {
  render: () => {
    const [status, setStatus] = useState<'idle' | 'checking' | 'saving' | 'saved' | 'no-changes' | 'error'>('idle');

    useEffect(() => {
      const statuses: Array<'idle' | 'checking' | 'saving' | 'saved' | 'no-changes' | 'error'> = [
        'checking',
        'saving',
        'saved',
        'idle',
        'checking',
        'no-changes',
        'idle',
        'checking',
        'saving',
        'error',
        'idle'
      ];

      let index = 0;
      const interval = setInterval(() => {
        setStatus(statuses[index]);
        index = (index + 1) % statuses.length;
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <SaveStatusIndicator status={status} />
        <p className="text-sm text-gray-500">Auto-cycling through statuses (2s interval)</p>
      </div>
    );
  },
};

export const WidthAnimation: Story = {
  render: () => {
    const [status, setStatus] = useState<'saved' | 'checking' | 'saving' | 'error'>('saved');

    useEffect(() => {
      const statuses: Array<'saved' | 'checking' | 'saving' | 'error'> = [
        'saved',        // shortest
        'checking',     // medium
        'saving',       // medium
        'error'         // longest ("Error saving")
      ];

      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % statuses.length;
        setStatus(statuses[index]);
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <SaveStatusIndicator status={status} />
        <p className="text-sm text-gray-500">Watch the width animate smoothly between different text lengths</p>
      </div>
    );
  },
};

export const Positioned: Story = {
  render: () => (
    <div className="relative w-[800px] h-[400px] bg-gray-100 rounded-lg">
      <SaveStatusIndicator status="saved" className="absolute top-4 right-4 z-50" />
      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
        Drawing canvas placeholder
      </div>
    </div>
  ),
};
