import type { Meta, StoryObj } from '@storybook/react';
import { DrawingCard } from './DrawingCard';
import { fn } from 'storybook/test';
import type { Drawing } from '@/types/drawing';
import { DrawingStatus } from '@/types/drawing';

const meta: Meta<typeof DrawingCard> = {
  title: 'Components/Drawing/DrawingCard',
  component: DrawingCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof DrawingCard>;

// Mock drawing data
const mockDrawing: Drawing = {
  id: '1',
  userId: 'user-123',
  title: 'Architecture Diagram',
  description: 'System architecture for the new microservices platform',
  contentUrl: '/drawings/1/content.json',
  thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNjM2NmYxIi8+PHJlY3QgeD0iMTYwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNjM2NmYxIi8+PHJlY3QgeD0iMTAwIiB5PSIxMjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg==',
  status: DrawingStatus.PUBLISHED,
  isPublic: true,
  tags: ['architecture', 'design'],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-02-20'),
  publishedAt: new Date('2024-02-20'),
  lastOpenedAt: new Date('2024-02-22'),
};

const mockPrivateDrawing: Drawing = {
  ...mockDrawing,
  id: '2',
  title: 'Personal Notes',
  description: 'My private brainstorming session',
  isPublic: false,
  status: DrawingStatus.DRAFT,
  publishedAt: null,
};

const mockDrawingNoThumbnail: Drawing = {
  ...mockDrawing,
  id: '3',
  title: 'Untitled Drawing',
  description: null,
  thumbnailUrl: null,
  contentUrl: null,
  status: DrawingStatus.DRAFT,
  publishedAt: null,
  updatedAt: new Date('2024-03-01'),
};

// Default card with thumbnail
export const Default: Story = {
  args: {
    drawing: mockDrawing,
  },
};

// Clickable card (with hover and interaction)
export const Clickable: Story = {
  args: {
    drawing: mockDrawing,
    onClick: fn(),
  },
};

// Private drawing
export const PrivateDrawing: Story = {
  args: {
    drawing: mockPrivateDrawing,
    onClick: fn(),
  },
};

// Without thumbnail (shows placeholder)
export const NoThumbnail: Story = {
  args: {
    drawing: mockDrawingNoThumbnail,
    onClick: fn(),
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
    drawing: mockDrawing,
  },
};

// Compact variant
export const Compact: Story = {
  args: {
    drawing: mockDrawing,
    variant: 'compact',
    onClick: fn(),
  },
};

// With last opened date
export const WithLastOpened: Story = {
  args: {
    drawing: mockDrawing,
    showLastOpened: true,
    onClick: fn(),
  },
};

// Long title and description (truncation)
export const LongContent: Story = {
  args: {
    drawing: {
      ...mockDrawing,
      title: 'This is a very long title that should be truncated when it exceeds the available width',
      description: 'This is a very long description that demonstrates how the component handles text overflow. It should be clamped to two lines maximum and show an ellipsis when the content is too long to fit in the available space.',
    },
    onClick: fn(),
  },
};

// Multiple cards showcase
export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl">
      <DrawingCard drawing={mockDrawing} onClick={fn()} />
      <DrawingCard drawing={mockPrivateDrawing} onClick={fn()} />
      <DrawingCard drawing={mockDrawingNoThumbnail} onClick={fn()} />
      <DrawingCard
        drawing={{
          ...mockDrawing,
          id: '4',
          title: 'Flowchart',
          description: 'User onboarding flow',
          updatedAt: new Date('2024-02-15'),
        }}
        onClick={fn()}
      />
      <DrawingCard
        drawing={{
          ...mockDrawing,
          id: '5',
          title: 'Wireframe',
          description: 'Mobile app wireframe',
          isPublic: false,
          updatedAt: new Date('2024-02-10'),
        }}
        onClick={fn()}
      />
      <DrawingCard loading />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    drawing: mockDrawing,
    onClick: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Tablet view
export const TabletView: Story = {
  args: {
    drawing: mockDrawing,
    onClick: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Interactive states showcase
export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-muted/20">
      <div>
        <h2 className="text-2xl font-bold mb-4">Drawing Card States</h2>
        <p className="text-muted-foreground mb-4">
          Displays a preview card for Excalidraw drawings with various states and configurations.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Default (Non-clickable)</h3>
          <div className="max-w-sm">
            <DrawingCard drawing={mockDrawing} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Clickable (Hover to see effect)</h3>
          <div className="max-w-sm">
            <DrawingCard drawing={mockDrawing} onClick={fn()} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Loading State</h3>
          <div className="max-w-sm">
            <DrawingCard loading drawing={mockDrawing} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">No Thumbnail</h3>
          <div className="max-w-sm">
            <DrawingCard drawing={mockDrawingNoThumbnail} onClick={fn()} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Privacy Badges</h3>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <DrawingCard drawing={mockDrawing} onClick={fn()} />
            <DrawingCard drawing={mockPrivateDrawing} onClick={fn()} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
