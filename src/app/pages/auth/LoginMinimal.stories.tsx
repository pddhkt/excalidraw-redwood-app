import type { Meta, StoryObj } from '@storybook/react';
import { LoginMinimal } from './LoginMinimal';

const meta: Meta<typeof LoginMinimal> = {
  title: 'Pages/Login/Minimal',
  component: LoginMinimal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoginMinimal>;

// Default minimal login
export const Default: Story = {};

// Minimal form only - centered view
export const FormOnly: Story = {
  render: () => {
    return (
      <div className="flex items-center justify-center p-8">
        <LoginMinimal />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Minimal login form in a centered view for component development.',
      },
    },
  },
};

// Comparison view - side by side
export const Comparison: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Minimal Design Approach</h2>
        <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
          A streamlined version focusing on essential elements and reduced visual noise.
        </p>
      </div>

      <div className="grid md:grid-cols-1 gap-8 max-w-md mx-auto">
        <div className="space-y-4">
          <h3 className="font-semibold text-center">Minimal Version</h3>
          <div className="border rounded-lg p-6 bg-background">
            <LoginMinimal />
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✓ No card container or shadows</p>
            <p>✓ Simplified button text (no emojis)</p>
            <p>✓ Reduced spacing and padding</p>
            <p>✓ Cleaner, more concise copy</p>
            <p>✓ Single-line legal text</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Mobile view
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// With pre-filled username
export const WithUsername: Story = {
  render: () => {
    return <LoginMinimal />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the form looks when user has entered a username.',
      },
    },
  },
};

// Design principles
export const DesignPrinciples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Minimal Login Design</h2>
        <p className="text-lg text-muted-foreground">
          A cleaner, more focused approach to authentication UI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">What's Removed</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">−</span>
              <span>Card wrapper with border and shadow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">−</span>
              <span>Decorative divider with "Choose an action"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">−</span>
              <span>Emoji icons in buttons and descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">−</span>
              <span>Multiple lines of legal/helper text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">−</span>
              <span>Label element for username input</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">−</span>
              <span>Verbose button text</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">What's Kept</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>All core functionality (login & register)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Remember me checkbox</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Error and success alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Loading states</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Accessibility features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Single security mention</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Design Benefits</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Faster Comprehension</h4>
            <p className="text-muted-foreground">
              Less visual noise means users understand what to do immediately
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Reduced Friction</h4>
            <p className="text-muted-foreground">
              Streamlined flow removes unnecessary decision points
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Modern Aesthetic</h4>
            <p className="text-muted-foreground">
              Clean, minimal design feels contemporary and professional
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <LoginMinimal />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
