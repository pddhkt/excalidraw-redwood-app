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