import type { LucideIcon } from 'lucide-react'

export type LearningCategoryKey = 'all' | 'financial-wellness' | 'protection' | 'life-planning' | 'practical'

export interface LearningCategory {
  key: LearningCategoryKey
  label: string
  description: string
  lessonCount: number
  icon: LucideIcon
}

export interface LearningLesson {
  id: string
  category: LearningCategoryKey
  categoryLabel: string
  title: string
  minutes: number
  points: number
  progress?: number
  art?: 'shield' | 'growth' | 'umbrella'
  tone?: 'teal' | 'navy' | 'crimson'
  photo?: boolean
  level?: string
  imageSource?: string
}

export interface ProtectionPurpose {
  title: string
  description: string
}
