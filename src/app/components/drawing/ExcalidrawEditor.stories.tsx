import type { Meta, StoryObj } from '@storybook/react';
import { ExcalidrawEditor, type SaveStatus } from './ExcalidrawEditor';
import { fn } from 'storybook/test';
import React, { useState, useEffect } from 'react';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/types';

const meta: Meta<typeof ExcalidrawEditor> = {
  title: 'Components/Drawing/ExcalidrawEditor',
  component: ExcalidrawEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'radio',
      options: ['light', 'dark'],
    },
    viewModeEnabled: {
      control: 'boolean',
    },
    gridModeEnabled: {
      control: 'boolean',
    },
    autoSaveInterval: {
      control: 'number',
    },
    saveStatus: {
      control: 'select',
      options: ['idle', 'checking', 'saving', 'saved', 'no-changes', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExcalidrawEditor>;

// Mock Excalidraw elements for testing
const mockElements: readonly ExcalidrawElement[] = [
  {
    id: 'rect-1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    angle: 0,
    strokeColor: '#1971c2',
    backgroundColor: '#a5d8ff',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: 1234567890,
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  },
  {
    id: 'text-1',
    type: 'text',
    x: 130,
    y: 150,
    width: 140,
    height: 25,
    angle: 0,
    strokeColor: '#1971c2',
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 987654321,
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    text: 'Hello Excalidraw!',
    fontSize: 20,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
    baseline: 18,
    containerId: null,
    originalText: 'Hello Excalidraw!',
    lineHeight: 1.25,
  },
] as readonly ExcalidrawElement[];

// Empty editor (default state)
export const Empty: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// Editor with initial content
export const WithContent: Story = {
  args: {
    initialData: {
      elements: mockElements,
      appState: {
        viewBackgroundColor: '#ffffff',
      },
    },
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// Read-only mode (view only)
export const ReadOnly: Story = {
  args: {
    initialData: {
      elements: mockElements,
    },
    viewModeEnabled: true,
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    initialData: {
      elements: mockElements,
      appState: {
        viewBackgroundColor: '#000000',
      },
    },
    theme: 'dark',
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%', backgroundColor: '#1a1a1a' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// With grid enabled
export const WithGrid: Story = {
  args: {
    gridModeEnabled: true,
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// Loading state
export const Loading: Story = {
  args: {
    isLoading: true,
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// Error state
export const Error: Story = {
  args: {
    error: 'Failed to load drawing content. The file may be corrupted or unavailable.',
  },
  render: (args) => (
    <div style={{ height: '600px', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
};

// Save status states
export const SaveStatusStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px' }}>
      <div>
        <h3 style={{ marginBottom: '8px' }}>Checking...</h3>
        <div style={{ height: '300px', border: '1px solid #ccc' }}>
          <ExcalidrawEditor saveStatus="checking" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '8px' }}>Saving...</h3>
        <div style={{ height: '300px', border: '1px solid #ccc' }}>
          <ExcalidrawEditor saveStatus="saving" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '8px' }}>Saved</h3>
        <div style={{ height: '300px', border: '1px solid #ccc' }}>
          <ExcalidrawEditor saveStatus="saved" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '8px' }}>No changes</h3>
        <div style={{ height: '300px', border: '1px solid #ccc' }}>
          <ExcalidrawEditor saveStatus="no-changes" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '8px' }}>Error</h3>
        <div style={{ height: '300px', border: '1px solid #ccc' }}>
          <ExcalidrawEditor saveStatus="error" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '8px' }}>Idle (no indicator)</h3>
        <div style={{ height: '300px', border: '1px solid #ccc' }}>
          <ExcalidrawEditor saveStatus="idle" />
        </div>
      </div>
    </div>
  ),
};

// Internal auto-save (component manages its own status)
export const InternalAutoSave: Story = {
  render: () => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [countdown, setCountdown] = useState(10);

    // Countdown timer
    useEffect(() => {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) return 10;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div style={{ height: '600px', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                🤖 Internal Auto-save: Every 10 seconds (Next check in {countdown}s)
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                Component manages status internally - no external callbacks needed
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: hasUnsavedChanges ? '#fef3c7' : '#d1fae5',
                color: hasUnsavedChanges ? '#92400e' : '#065f46',
                fontWeight: 'bold'
              }}>
                Unsaved: {hasUnsavedChanges ? '✓ Yes' : '— No'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <ExcalidrawEditor
            autoSaveInterval={10000}
            onUnsavedChangesChange={setHasUnsavedChanges}
            onChange={fn()}
          />
        </div>
      </div>
    );
  },
};

// With auto-save enabled (external status control - demonstrates callback pattern)
export const WithAutoSave: Story = {
  render: () => {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleAutoSaveCheck = (hasChanges: boolean) => {
      setLastChecked(new Date());

      if (hasChanges) {
        setSaveStatus('saving');

        // Simulate save operation
        setTimeout(() => {
          setSaveStatus('saved');
          setLastSaved(new Date());

          // Auto-hide after 2 seconds
          setTimeout(() => {
            setSaveStatus('idle');
          }, 2000);
        }, 600);
      } else {
        setSaveStatus('no-changes');

        // Auto-hide after 1.5 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 1500);
      }
    };

    return (
      <div style={{ height: '600px', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                📡 External Auto-save: Every 5 seconds
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                Status controlled via onAutoSaveCheck callback
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: hasUnsavedChanges ? '#fef3c7' : '#d1fae5',
                color: hasUnsavedChanges ? '#92400e' : '#065f46',
                fontWeight: 'bold'
              }}>
                Unsaved: {hasUnsavedChanges ? '✓ Yes' : '— No'}
              </div>
              {lastChecked && (
                <div>
                  <strong>Last Check:</strong> {lastChecked.toLocaleTimeString()}
                </div>
              )}
              {lastSaved && (
                <div>
                  <strong>Last Saved:</strong> {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <ExcalidrawEditor
            autoSaveInterval={5000}
            onAutoSaveCheck={handleAutoSaveCheck}
            onAutoSave={fn()}
            onUnsavedChangesChange={setHasUnsavedChanges}
            saveStatus={saveStatus}
            onChange={fn()}
          />
        </div>
      </div>
    );
  }
};

// Full height (real-world usage)
export const FullHeight: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ height: '100vh', width: '100%' }}>
      <ExcalidrawEditor {...args} />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Animation Demo - Interactive status switcher
export const AnimationDemo: Story = {
  args: {
    saveStatus: "saved"
  },

  render: () => {
    const [currentStatus, setCurrentStatus] = useState<SaveStatus>('idle');

    const statuses: SaveStatus[] = ['idle', 'checking', 'saving', 'saved', 'no-changes', 'error'];

    const statusDescriptions = {
      idle: 'No indicator shown',
      checking: 'Icon grows from small, text slides up',
      saving: 'Icon grows from small, text slides up',
      saved: 'Icon grows from small, text slides up',
      'no-changes': 'Icon grows from small, text slides up',
      error: 'Icon grows from small, text slides up',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div
          style={{
            padding: '24px',
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #dee2e6',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
            🎬 Animation Demo - Click to Switch Status
          </h2>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            Watch the indicator animate: Icon grows from 0 to normal size (0.4s), text slides up from bottom with ease-out (0.3s)
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setCurrentStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: currentStatus === status ? '2px solid #1971c2' : '2px solid #dee2e6',
                  backgroundColor: currentStatus === status ? '#e7f5ff' : 'white',
                  color: currentStatus === status ? '#1971c2' : '#495057',
                  fontWeight: currentStatus === status ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'no-changes' ? 'No Changes' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#e7f5ff',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1971c2'
          }}>
            <strong>Current:</strong> {currentStatus} — {statusDescriptions[currentStatus]}
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <ExcalidrawEditor saveStatus={currentStatus} />
        </div>
      </div>
    );
  },

  parameters: {
    layout: 'fullscreen',
  }
};

