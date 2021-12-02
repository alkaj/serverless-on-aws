import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserEmail, getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { verifyEmail } from '../../helpers/emails'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    newTodo.email = getUserEmail(event)
    // try to verify the user on SES...
    await verifyEmail(newTodo.email)
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event)
    const item = await createTodo(userId, newTodo)
    return item.todoId
      ? {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            item
          })
        }
      : {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            item
          })
        }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
