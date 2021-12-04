export interface TodoItem {
  userId: string
  email: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: number
  expiring: number
  expired: number
  attachmentUrl?: string
}
