import type { Role } from '../context/AuthContext'

export type TrainingInstructor = {
  id: string
  name: string
  role: Role
}

export type EsoliupoTraining = {
  id: string
  title: string
  description: string
  place: string
  date: string
  published: boolean
  instructor: TrainingInstructor
  enrolledCount: number
  enrolled?: boolean
  createdAt: string
  updatedAt: string
}

export type TrainingEnrollee = {
  id: string
  name: string
  email: string
  studies: string | null
  enrolledAt: string
}

export type UserDirectoryEntry = {
  id: string
  name: string
  email: string
  role: Role
}
