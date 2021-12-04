import { getPendingTodos } from '../../business/todos'
import { TodosAccess } from '../../helpers/todosAcess'
import { TodoItem } from '../../models/TodoItem'

import { sendEmail } from '../../helpers/emails'

import { createLogger } from '../../utils/logger'
import * as middy from 'middy'

export const handler = middy(async () => {
  const logger = createLogger('CheckDueDate')

  // TODO: Search for the expiring expired tasks
  const pendingTodos = (await getPendingTodos()) as TodoItem[]

  // mark the pendingTodos so that only those with dueDate before today pass
  pendingTodos.filter((v) =>
    new Date(v.dueDate) < new Date(new Date().toDateString())
      ? (v.expired = 1)
      : (v.expired = 0)
  )
  // mark the pendingTodos so that only those with dueDate to today pass
  pendingTodos.map((v) =>
    !v.expired &&
    new Date(v.dueDate).toDateString() == new Date().toDateString()
      ? (v.expiring += 1)
      : v.expiring == 0
      ? (v.expiring += 0)
      : (v.expiring += 1)
  )
  // TODO: Send emails for expirating soon notice
  const expiring = pendingTodos.filter((v) => v.expiring == 1)
  const emails: string[] =
    expiring.length == 0
      ? []
      : expiring.reduce((a: string[], v: TodoItem) => {
          a.push(v.email)
          return a
        }, [])
  if (emails.length > 0) await sendExpiringSoonEmail(emails)

  // TODO: Send emails to users for expiration notice
  const expired = pendingTodos.filter((v) => v.expired)
  const xmails: string[] =
    expired.length == 0
      ? []
      : expired.reduce((a: string[], v: TodoItem) => {
          a.push(v.email)
          return a
        }, [])
  if (xmails.length > 0) await sendTaskExpiredEmail(xmails)

  // TODO: persist update on the affected todos
  for (const t of pendingTodos.filter((v) => v.expired || v.expiring)) {
    logger.info(
      new Date().toDateString() +
        ' - About to update the todo with date viewed here: ' +
        new Date(t.dueDate).toDateString(),
      t
    )
    const updated = await TodosAccess.updateTodo(t.userId, t.todoId, t)
    logger.info('Updating the todoItem', updated)
  }
})

const sendExpiringSoonEmail = async (emails: string[]) => {
  await sendEmail(
    'Task due in less than 24 hours!',
    emails,
    'Hi, this is a gentle reminder that at least one of your tasks is due in less than 24 hours, please check it out.',
    `<h4>Hello,</h4><p>This is a gentle reminder that at least one of your tasks is due in less than 24 hours, please check it out.</p><br><p>Thanks,</p><p>Your KAJ-ToDo-s bot</p>`
  )
}

const sendTaskExpiredEmail = async (emails: string[]) => {
  await sendEmail(
    'Task overdue !',
    emails,
    'Hi, this is a gentle reminder that at least one of your tasks is due passed now, please check it out.',
    `<h4>Hello,</h4><p>This is a gentle reminder that at least one of your tasks is due passed now, please check it out.</p><br><p>Thanks,</p><p>Your KAJ-ToDo-s bot</p>`
  )
}
