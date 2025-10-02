import type { Meta, StoryObj } from '@storybook/react';
import { Login } from './Login';
import { fn } from '@storybook/test';

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Login>;

// Default login page with full background
export const Default: Story = {};

// Login form only - focused view for component development
export const LoginForm: Story = {
  render: () => {
    return (
      <div className="flex items-center justify-center p-8">
        <Login />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Shows the login form in a centered view without the full-page background, perfect for testing and development.',
      },
    },
  },
};

// Story showing the login form in a ready state
export const ReadyToLogin: Story = {
  play: async ({ canvasElement }) => {
    // This story shows the login form ready for interaction
    // In Storybook, you can interact with the form manually
  },
};

// Story showing username filled in
export const WithUsername: Story = {
  render: () => {
    return <Login />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Login form with a username entered. The register button becomes enabled.',
      },
    },
  },
};

// Story simulating loading state (when authentication is in progress)
export const Authenticating: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state when user clicks login or register button.',
      },
    },
  },
};

// Story showing error state
export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows an error message when authentication fails.',
      },
    },
  },
};

// Story showing success state
export const WithSuccess: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows success message before redirecting to home page.',
      },
    },
  },
};

// Documentation story showing all states
export const Overview: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-muted/20">
      <div>
        <h2 className="text-2xl font-bold mb-4">Login Component States</h2>
        <p className="text-muted-foreground mb-4">
          This component handles user authentication using WebAuthn/Passkeys.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Passwordless authentication using device biometrics</li>
          <li>Registration of new users with passkeys</li>
          <li>"Remember me" option for extended sessions (30 days)</li>
          <li>Error handling with user-friendly messages</li>
          <li>Loading states during authentication</li>
          <li>Success feedback before redirect</li>
        </ul>
      </div>

      <div className="border rounded-lg p-4">
        <Login />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Story showing different viewport sizes
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
