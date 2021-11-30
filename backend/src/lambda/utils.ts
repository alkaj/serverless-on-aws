import { APIGatewayProxyEvent } from 'aws-lambda'
import { parseUserId, parseUserEmail } from '../auth/utils'

/**
 * Get a user email from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user email from a JWT token
 */
export function getUserEmail(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserEmail(jwtToken)
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}
