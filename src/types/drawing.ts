export enum DrawingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface Drawing {
  id: string
  userId: string
  title: string
  description?: string | null
  contentUrl?: string | null // R2 path to drawing JSON (not the full content)
  thumbnailUrl?: string | null // R2 path to thumbnail image
  status: DrawingStatus
  isPublic: boolean
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date | null // When status changed to PUBLISHED
  lastOpenedAt?: Date | null
}

export interface DrawingCardProps {
  drawing: Drawing
  onClick?: (drawing: Drawing) => void
  className?: string
  variant?: 'default' | 'compact'
  showLastOpened?: boolean
  loading?: boolean
}

export interface CreateDrawingFormData {
  title: string
  description?: string
  isPublic: boolean
}

export interface CreateDrawingFormProps {
  onSubmit?: (data: CreateDrawingFormData) => void | Promise<void>
  onCancel?: () => void
  initialData?: Partial<CreateDrawingFormData>
  loading?: boolean
  className?: string
}

// Re-export Excalidraw types for convenience
export type {
  ExcalidrawElement,
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types/types'

// Excalidraw scene data structure
export interface ExcalidrawScene {
  elements: readonly ExcalidrawElement[]
  appState?: Partial<AppState>
  files?: BinaryFiles
}

// Editor props for the Excalidraw wrapper component
export interface ExcalidrawEditorProps {
  initialData?: ExcalidrawScene
  onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void
  onAutoSave?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void
  autoSaveInterval?: number
  viewModeEnabled?: boolean
  gridModeEnabled?: boolean
  theme?: 'light' | 'dark'
  className?: string
  isLoading?: boolean
  error?: string
}

// Import these types to avoid circular dependencies
import type {
  ExcalidrawElement,
  AppState,
  BinaryFiles,
} from '@excalidraw/excalidraw/types/types'