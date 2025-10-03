import type { Meta, StoryObj } from '@storybook/react';
import { CreateDrawingForm } from './CreateDrawingForm';
import { LayoutContainer } from '@/app/components/layout/LayoutContainer';
import { fn } from 'storybook/test';

const meta: Meta<typeof CreateDrawingForm> = {
  title: 'Components/Drawing/CreateDrawingForm',
  component: CreateDrawingForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
};

export default meta;
type Story = StoryObj<typeof CreateDrawingForm>;

// Default form - empty state
export const Default: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
};

// With initial data
export const WithInitialData: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    initialData: {
      title: 'System Architecture',
      description: 'Diagram showing the microservices architecture for our platform',
      isPublic: true,
    },
  },
};

// Loading state
export const Loading: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    loading: true,
    initialData: {
      title: 'New Drawing',
      description: 'Creating...',
      isPublic: false,
    },
  },
};

// Public drawing (switch enabled)
export const PublicDrawing: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    initialData: {
      title: 'Team Brainstorm',
      isPublic: true,
    },
  },
};

// Private drawing (switch disabled)
export const PrivateDrawing: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    initialData: {
      title: 'Personal Notes',
      description: 'Private sketches and ideas',
      isPublic: false,
    },
  },
};

// Centered layout (recommended for create page)
export const CenteredLayout: Story = {
  render: (args: typeof meta.args) => (
    <LayoutContainer variant="centered">
      <CreateDrawingForm {...args} />
    </LayoutContainer>
  ),
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

// Compact layout (for modals)
export const CompactLayout: Story = {
  render: (args: typeof meta.args) => (
    <LayoutContainer variant="compact">
      <CreateDrawingForm {...args} />
    </LayoutContainer>
  ),
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
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
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Form validation demo (empty title)
export const ValidationError: Story = {
  render: () => {
    const handleSubmit = async () => {
      // This will trigger validation error since title is empty
      return Promise.resolve();
    };

    return (
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Try submitting without a title</p>
          <p className="text-xs text-muted-foreground">
            The form validates that a title is required. Click "Create Drawing" to see the validation error.
          </p>
        </div>
        <CreateDrawingForm onSubmit={handleSubmit} onCancel={fn()} />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// Interactive demo with all states
export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-muted/20 min-h-screen">
      <div>
        <h2 className="text-2xl font-bold mb-4">Create Drawing Form States</h2>
        <p className="text-muted-foreground mb-4">
          Form component for creating new Excalidraw drawings with validation and privacy controls.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Empty Form</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Default state with no initial data
          </p>
          <div className="max-w-2xl">
            <CreateDrawingForm onSubmit={fn()} onCancel={fn()} />
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-3">Pre-filled Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Form with initial values (edit mode simulation)
          </p>
          <div className="max-w-2xl">
            <CreateDrawingForm
              onSubmit={fn()}
              onCancel={fn()}
              initialData={{
                title: 'Wireframe Design',
                description: 'Mobile app wireframe with key user flows',
                isPublic: true,
              }}
            />
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-3">Loading State</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Form disabled while submitting
          </p>
          <div className="max-w-2xl">
            <CreateDrawingForm
              onSubmit={fn()}
              onCancel={fn()}
              loading={true}
              initialData={{
                title: 'New Drawing',
                isPublic: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Recommended layout for create page
export const RecommendedCreatePage: Story = {
  render: () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LayoutContainer variant="centered">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Start Creating</h1>
            <p className="text-muted-foreground">
              Set up your new drawing and start diagramming
            </p>
          </div>
          <CreateDrawingForm
            onSubmit={fn()}
            onCancel={fn()}
          />
        </div>
      </LayoutContainer>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Dark mode demo
export const DarkMode: Story = {
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
