import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="w-96">
      <AlertDescription>
        This is a default alert message.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertDescription>
        An error occurred. Please try again.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success" className="w-96">
      <AlertDescription>
        Operation completed successfully!
      </AlertDescription>
    </Alert>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Alert className="w-96">
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This alert includes both a title and description.
      </AlertDescription>
    </Alert>
  ),
};

export const DestructiveWithTitle: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const SuccessWithTitle: Story = {
  render: () => (
    <Alert variant="success" className="w-96">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const LoginError: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertDescription>
        Login failed. Please check your credentials and try again.
      </AlertDescription>
    </Alert>
  ),
};

export const RegistrationSuccess: Story = {
  render: () => (
    <Alert variant="success" className="w-96">
      <AlertDescription>
        Registration successful! Redirecting...
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>
          This is a default alert with a title.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          This is a destructive alert with a title.
        </AlertDescription>
      </Alert>

      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          This is a success alert with a title.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
