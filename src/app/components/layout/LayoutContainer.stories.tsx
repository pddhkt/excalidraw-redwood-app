import type { Meta, StoryObj } from '@storybook/react';
import { LayoutContainer } from './LayoutContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';

const meta: Meta<typeof LayoutContainer> = {
  title: 'Components/Layout/LayoutContainer',
  component: LayoutContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['centered', 'full', 'compact', 'narrow'],
      description: 'Layout variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LayoutContainer>;

// Sample content for demonstrations
const SampleCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Sample Content</CardTitle>
      <CardDescription>This demonstrates the layout container behavior</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        The layout container controls how content is positioned on the page.
        Try different variants to see how the content adapts.
      </p>
    </CardContent>
  </Card>
);

// Centered variant (default) - good for forms and focused content
export const Centered: Story = {
  args: {
    variant: 'centered',
    children: <SampleCard />,
  },
};

// Full width variant - good for dashboards and list views
export const Full: Story = {
  args: {
    variant: 'full',
    children: (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SampleCard />
          <SampleCard />
          <SampleCard />
        </div>
      </div>
    ),
  },
};

// Compact variant - good for modals and small forms
export const Compact: Story = {
  args: {
    variant: 'compact',
    children: <SampleCard />,
  },
};

// Narrow variant - good for reading content
export const Narrow: Story = {
  args: {
    variant: 'narrow',
    children: (
      <Card>
        <CardHeader>
          <CardTitle>Article Title</CardTitle>
          <CardDescription>A narrower layout for better readability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris.
          </p>
          <p className="text-sm">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
          </p>
        </CardContent>
      </Card>
    ),
  },
};

// Comparison of all variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 bg-muted/20">
      <div>
        <h2 className="text-2xl font-bold mb-4 px-4 pt-4">Layout Container Variants</h2>
        <p className="text-muted-foreground mb-4 px-4">
          Different layout options for different use cases
        </p>
      </div>

      <div className="space-y-8">
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-2 px-4">Centered (max-w-2xl)</h3>
          <p className="text-sm text-muted-foreground mb-4 px-4">
            Perfect for forms and focused content. Vertically and horizontally centered.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 min-h-[300px]">
            <LayoutContainer variant="centered">
              <SampleCard />
            </LayoutContainer>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-2 px-4">Full (container)</h3>
          <p className="text-sm text-muted-foreground mb-4 px-4">
            Uses full width with responsive container padding. Good for dashboards.
          </p>
          <div className="bg-green-50 dark:bg-green-950 min-h-[300px]">
            <LayoutContainer variant="full">
              <SampleCard />
            </LayoutContainer>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-2 px-4">Compact (max-w-md)</h3>
          <p className="text-sm text-muted-foreground mb-4 px-4">
            Smaller centered layout. Great for login forms and modals.
          </p>
          <div className="bg-purple-50 dark:bg-purple-950 min-h-[300px]">
            <LayoutContainer variant="compact">
              <SampleCard />
            </LayoutContainer>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-2 px-4">Narrow (max-w-lg)</h3>
          <p className="text-sm text-muted-foreground mb-4 px-4">
            Optimized for reading. Good for articles and content pages.
          </p>
          <div className="bg-orange-50 dark:bg-orange-950 min-h-[300px]">
            <LayoutContainer variant="narrow">
              <SampleCard />
            </LayoutContainer>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Mobile responsive demo
export const MobileResponsive: Story = {
  args: {
    variant: 'centered',
    children: <SampleCard />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
