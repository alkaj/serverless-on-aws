export interface Todo {
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: number
  expired: number
  expiring: number
  attachmentUrl?: string
}
