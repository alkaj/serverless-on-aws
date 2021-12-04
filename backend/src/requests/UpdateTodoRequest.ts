/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  dueDate: string
  done: number
  expired: number
  expiring: number
}
