import type { Meta, StoryObj } from '@storybook/react';
import { DrawingCard } from './DrawingCard';
import { fn } from 'storybook/test';
import type { Drawing } from '@/types/drawing';
import { DrawingStatus } from '@/types/drawing';

// Component wrapper for list/grid display
const DrawingList = ({
  drawings,
  loading = false,
  onCardClick,
  columns = 'responsive'
}: {
  drawings: Drawing[],
  loading?: boolean,
  onCardClick?: (drawing: Drawing) => void,
  columns?: 'responsive' | '1' | '2' | '3' | '4'
}) => {
  const gridClasses = {
    'responsive': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridClasses[columns]} gap-4 p-4`}>
        {[...Array(6)].map((_, i) => (
          <DrawingCard key={i} loading drawing={drawings[0] || {} as Drawing} />
        ))}
      </div>
    );
  }

  if (drawings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <svg
          className="w-16 h-16 text-muted-foreground mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">No drawings yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Get started by creating your first drawing. Your drawings will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 p-4`}>
      {drawings.map((drawing) => (
        <DrawingCard
          key={drawing.id}
          drawing={drawing}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
};

const meta: Meta<typeof DrawingList> = {
  title: 'Components/Drawing/DrawingList',
  component: DrawingList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DrawingList>;

// Mock drawing data
const mockDrawings: Drawing[] = [
  {
    id: '1',
    userId: 'user-123',
    title: 'Architecture Diagram',
    description: 'System architecture for the new microservices platform',
    contentUrl: null,
    thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNjM2NmYxIi8+PHJlY3QgeD0iMTYwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNjM2NmYxIi8+PHJlY3QgeD0iMTAwIiB5PSIxMjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg==',
    isPublic: true,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['architecture', 'design'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    lastOpenedAt: new Date('2024-02-22'),
  },
  {
    id: '2',
    userId: 'user-123',
    title: 'User Flow Diagram',
    description: 'Complete user onboarding flow with decision points',
    contentUrl: null,
    thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2VmZjZmZiIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iOTAiIHI9IjMwIiBmaWxsPSIjMTBiOTgxIi8+PHJlY3QgeD0iMTQwIiB5PSI2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTBiOTgxIi8+PGNpcmNsZSBjeD0iMjYwIiBjeT0iOTAiIHI9IjMwIiBmaWxsPSIjMTBiOTgxIi8+PC9zdmc+',
    isPublic: false,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['ux', 'flow'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-18'),
    lastOpenedAt: new Date('2024-02-21'),
  },
  {
    id: '3',
    userId: 'user-123',
    title: 'Wireframe - Mobile App',
    description: null,
    contentUrl: null,
    thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2ZmZjdlZCIvPjxyZWN0IHg9IjEwMCIgeT0iMjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTQwIiBmaWxsPSIjZmJjZjMzIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjExMCIgeT0iNDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmZmZmYiLz48cmVjdCB4PSIxMTAiIHk9IjcwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+',
    isPublic: true,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['wireframe', 'mobile'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
    lastOpenedAt: null,
  },
  {
    id: '4',
    userId: 'user-123',
    title: 'Database Schema',
    description: 'Entity relationship diagram for the database',
    contentUrl: null,
    thumbnailUrl: null,
    isPublic: false,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['database', 'schema'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-12'),
    lastOpenedAt: new Date('2024-02-14'),
  },
  {
    id: '5',
    userId: 'user-123',
    title: 'Marketing Infographic',
    description: 'Visual representation of Q1 marketing metrics and goals',
    contentUrl: null,
    thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2ZlZjJmMiIvPjxyZWN0IHg9IjQwIiB5PSIxMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2VmNDQ0NCIvPjxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI4MCIgZmlsbD0iI2VmNDQ0NCIvPjxyZWN0IHg9IjE2MCIgeT0iNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNlZjQ0NDQiLz48cmVjdCB4PSIyMjAiIHk9IjYwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZWY0NDQ0Ii8+PC9zdmc+',
    isPublic: true,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['marketing', 'infographic'],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-19'),
    lastOpenedAt: new Date('2024-02-20'),
  },
  {
    id: '6',
    userId: 'user-123',
    title: 'Brainstorming Session',
    description: 'Team brainstorming notes and ideas',
    contentUrl: null,
    thumbnailUrl: null,
    isPublic: false,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['brainstorming', 'notes'],
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-16'),
    lastOpenedAt: new Date('2024-02-17'),
  },
  {
    id: '7',
    userId: 'user-123',
    title: 'API Documentation',
    description: 'REST API endpoints and data flow diagram',
    contentUrl: null,
    thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2VkZTlmZSIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjYTc4YmZhIi8+PHJlY3QgeD0iMTMwIiB5PSI0MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjYTc4YmZhIi8+PHJlY3QgeD0iMjIwIiB5PSI0MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjYTc4YmZhIi8+PHJlY3QgeD0iMTMwIiB5PSIxMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2E3OGJmYSIvPjwvc3ZnPg==',
    isPublic: true,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['api', 'documentation'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-14'),
    lastOpenedAt: new Date('2024-02-18'),
  },
  {
    id: '8',
    userId: 'user-123',
    title: 'Org Chart',
    description: 'Company organizational structure',
    contentUrl: null,
    thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjEyMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzMzMzMzMyIvPjxyZWN0IHg9IjQwIiB5PSI4MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNjY2NjY2Ii8+PHJlY3QgeD0iMTMwIiB5PSI4MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNjY2NjY2Ii8+PHJlY3QgeD0iMjIwIiB5PSI4MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNjY2NjY2Ii8+PHJlY3QgeD0iNDAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOTk5OTk5Ii8+PHJlY3QgeD0iMTQwIiB5PSIxNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzk5OTk5OSIvPjxyZWN0IHg9IjI0MCIgeT0iMTQwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=',
    isPublic: false,
    status: DrawingStatus.DRAFT,
    publishedAt: null,
    tags: ['org', 'team'],
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-13'),
    lastOpenedAt: new Date('2024-02-13'),
  },
];

// Responsive grid (default)
export const ResponsiveGrid: Story = {
  args: {
    drawings: mockDrawings,
    onCardClick: fn(),
    columns: 'responsive',
  },
};

// Fixed columns
export const TwoColumns: Story = {
  args: {
    drawings: mockDrawings.slice(0, 4),
    onCardClick: fn(),
    columns: '2',
  },
};

export const ThreeColumns: Story = {
  args: {
    drawings: mockDrawings.slice(0, 6),
    onCardClick: fn(),
    columns: '3',
  },
};

export const FourColumns: Story = {
  args: {
    drawings: mockDrawings,
    onCardClick: fn(),
    columns: '4',
  },
};

// Empty state
export const EmptyState: Story = {
  args: {
    drawings: [],
    onCardClick: fn(),
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    drawings: mockDrawings,
    loading: true,
    onCardClick: fn(),
  },
};

// Small dataset (1-3 items)
export const SmallDataset: Story = {
  args: {
    drawings: mockDrawings.slice(0, 3),
    onCardClick: fn(),
    columns: 'responsive',
  },
};

// Mixed public/private
export const MixedPrivacy: Story = {
  args: {
    drawings: mockDrawings.slice(0, 6),
    onCardClick: fn(),
    columns: 'responsive',
  },
};

// Mobile view (single column)
export const MobileView: Story = {
  args: {
    drawings: mockDrawings.slice(0, 4),
    onCardClick: fn(),
    columns: 'responsive',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Tablet view (2 columns)
export const TabletView: Story = {
  args: {
    drawings: mockDrawings.slice(0, 6),
    onCardClick: fn(),
    columns: 'responsive',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Desktop view (3-4 columns)
export const DesktopView: Story = {
  args: {
    drawings: mockDrawings,
    onCardClick: fn(),
    columns: 'responsive',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-background">
      <div>
        <h2 className="text-2xl font-bold mb-4">Drawing List / Grid</h2>
        <p className="text-muted-foreground mb-4">
          Responsive grid layout for displaying multiple drawing cards. Adapts from 1 column on mobile to 4 columns on wide screens.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Responsive Grid (Default)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          1 column on mobile, 2 on small tablets, 3 on desktop, 4 on wide screens
        </p>
        <DrawingList drawings={mockDrawings} onCardClick={fn()} columns="responsive" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Empty State</h3>
        <DrawingList drawings={[]} onCardClick={fn()} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Loading State</h3>
        <DrawingList drawings={mockDrawings} loading onCardClick={fn()} />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
