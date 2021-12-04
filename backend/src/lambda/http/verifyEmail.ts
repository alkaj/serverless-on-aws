import { APIGatewayProxyEvent } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { verifyEmail } from '../../helpers/emails'
import { getUserEmail } from '../utils'
//     try to verify the user on SES...

export const handler = middy(async (event: APIGatewayProxyEvent) => {
  const email = getUserEmail(event)
  await verifyEmail(email)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
