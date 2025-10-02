export interface Drawing {
  id: string
  userId: string
  title: string
  description?: string | null
  content: string // JSON string of Excalidraw data
  thumbnail?: string | null // Base64 or URL for preview
  isPublic: boolean
  isArchived?: boolean
  tags?: string[]
  createdAt: Date
  updatedAt: Date
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