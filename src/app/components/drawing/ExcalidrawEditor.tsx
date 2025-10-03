"use client";

import "@excalidraw/excalidraw/index.css";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawElement,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types/types";

export type SaveStatus = "idle" | "checking" | "saving" | "saved" | "no-changes" | "error";

export interface ExcalidrawEditorProps {
  /**
   * Initial drawing data (Excalidraw elements)
   */
  initialData?: {
    elements?: readonly ExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
  };

  /**
   * Callback when drawing content changes
   */
  onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void;

  /**
   * Auto-save interval in milliseconds (0 to disable)
   */
  autoSaveInterval?: number;

  /**
   * Callback when auto-save is triggered (only if changes detected)
   */
  onAutoSave?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void;

  /**
   * Callback when auto-save check occurs
   */
  onAutoSaveCheck?: (hasChanges: boolean) => void;

  /**
   * Callback when unsaved changes state changes (for debugging)
   */
  onUnsavedChangesChange?: (hasChanges: boolean) => void;

  /**
   * Whether the editor is in read-only mode
   */
  viewModeEnabled?: boolean;

  /**
   * Whether to show the grid
   */
  gridModeEnabled?: boolean;

  /**
   * Theme: light or dark
   */
  theme?: "light" | "dark";

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Current save status
   */
  saveStatus?: SaveStatus;
}

/**
 * Save Status Indicator Component with Framer Motion Animations
 * Animates content changes (icon/text) rather than entire badge
 */
function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const statusConfig = {
    checking: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: "Checking...",
      bgColor: "#6b7280", // gray-500
    },
    saving: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: "Saving...",
      bgColor: "#3b82f6", // blue-500
    },
    saved: {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Saved",
      bgColor: "#22c55e", // green-500
    },
    "no-changes": {
      icon: <Info className="h-4 w-4" />,
      text: "No changes",
      bgColor: "#9ca3af", // gray-400
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Error saving",
      bgColor: "#ef4444", // red-500
    },
  };

  const config = status !== "idle" ? statusConfig[status] : null;

  if (!config) return null;

  return (
    <div className="absolute top-4 right-4 z-50">
      <motion.div
        layout
        initial={{ backgroundColor: config.bgColor }}
        animate={{ backgroundColor: config.bgColor }}
        transition={{
          backgroundColor: { duration: 0.3 },
          layout: { duration: 0.3, ease: "easeInOut" }
        }}
        className="px-3 py-2 rounded-md shadow-lg flex items-center gap-2 text-sm font-medium text-white overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`icon-${status}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {config.icon}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.span
            key={`text-${status}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            {config.text}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/**
 * Helper function to create a hash of elements for change detection
 */
function getElementsHash(elements: readonly ExcalidrawElement[]): string {
  return JSON.stringify(elements.map(el => ({
    id: el.id,
    type: el.type,
    version: el.version,
    versionNonce: el.versionNonce,
  })));
}

/**
 * ExcalidrawEditor - A wrapper component for Excalidraw
 *
 * This component must be used as a client component ("use client")
 * since Excalidraw requires browser APIs and client-side rendering.
 */
export function ExcalidrawEditor({
  initialData,
  onChange,
  autoSaveInterval = 0,
  onAutoSave,
  onAutoSaveCheck,
  onUnsavedChangesChange,
  viewModeEnabled = false,
  gridModeEnabled = false,
  theme = "light",
  className = "",
  isLoading = false,
  error,
  saveStatus: externalSaveStatus,
}: ExcalidrawEditorProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [internalSaveStatus, setInternalSaveStatus] = useState<SaveStatus>("idle");

  // Use external status if provided, otherwise use internal status
  const saveStatus = externalSaveStatus ?? internalSaveStatus;

  // Handle onChange events
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      if (onChange) {
        onChange(elements, appState, files);
      }
    },
    [onChange]
  );

  // Subscribe to onPointerUp to track user interactions
  useEffect(() => {
    if (!excalidrawAPI) return;

    console.log('✅ Subscribing to onPointerUp');

    const unsubscribe = excalidrawAPI.onPointerUp(() => {
      console.log('🖱️ onPointerUp triggered - setting hasUnsavedChanges = true');
      setHasUnsavedChanges(true);
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(true);
      }
    });

    return () => {
      console.log('🔴 Unsubscribing from onPointerUp');
      unsubscribe();
    };
  }, [excalidrawAPI, onUnsavedChangesChange]);

  // Auto-save functionality with real-time change detection and status management
  useEffect(() => {
    if (!excalidrawAPI || autoSaveInterval <= 0) {
      return;
    }

    console.log('⏰ Auto-save interval started:', autoSaveInterval, 'ms');

    const interval = setInterval(() => {
      console.log('⏰ Auto-save check:', { hasUnsavedChanges });

      // Only manage internal status if no external status is provided
      const shouldManageStatus = externalSaveStatus === undefined;

      if (shouldManageStatus) {
        setInternalSaveStatus('checking');
      }

      // Brief delay to show "checking" status
      setTimeout(async () => {
        // Notify about the check
        if (onAutoSaveCheck) {
          onAutoSaveCheck(hasUnsavedChanges);
        }

        // Only save if there are unsaved changes
        if (hasUnsavedChanges) {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const files = excalidrawAPI.getFiles();

          console.log('💾 Saving changes...', elements.length, 'elements');

          if (shouldManageStatus) {
            setInternalSaveStatus('saving');
          }

          // Call onAutoSave if provided
          if (onAutoSave) {
            try {
              await onAutoSave(elements, appState, files);
            } catch (error) {
              console.error('Save error:', error);
              if (shouldManageStatus) {
                setInternalSaveStatus('error');
                setTimeout(() => setInternalSaveStatus('idle'), 3000);
              }
              return;
            }
          }

          // Reset unsaved changes flag
          setHasUnsavedChanges(false);
          if (onUnsavedChangesChange) {
            onUnsavedChangesChange(false);
          }

          if (shouldManageStatus) {
            setInternalSaveStatus('saved');
            // Auto-hide after 2 seconds
            setTimeout(() => setInternalSaveStatus('idle'), 2000);
          }
        } else {
          console.log('ℹ️ No changes to save');

          if (shouldManageStatus) {
            setInternalSaveStatus('no-changes');
            // Auto-hide after 1.5 seconds
            setTimeout(() => setInternalSaveStatus('idle'), 1500);
          }
        }
      }, 300);
    }, autoSaveInterval);

    return () => {
      console.log('🔴 Auto-save interval cleared');
      clearInterval(interval);
    };
  }, [excalidrawAPI, onAutoSave, onAutoSaveCheck, onUnsavedChangesChange, autoSaveInterval, hasUnsavedChanges, externalSaveStatus]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted ${className}`}>
        <div className="text-center space-y-4 max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold">Failed to load editor</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full relative ${className}`}>
      <SaveStatusIndicator status={saveStatus} />
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialData}
        onChange={handleChange}
        viewModeEnabled={viewModeEnabled}
        gridModeEnabled={gridModeEnabled}
        theme={theme}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
