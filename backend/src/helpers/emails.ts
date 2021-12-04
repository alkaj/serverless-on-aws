import * as AWS from 'aws-sdk'

import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
// TODO: use the logger provided intead of console.log...

export const sender = async (params) => {
  XAWS.config.update({ region: 'us-east-1' })
  const prom = new XAWS.SES({
    apiVersion: '2010-12-01'
  })
  const r = await prom.sendEmail(params).promise()

  return r
}

export const verifyEmail = async (email: string) => {
  XAWS.config.update({ region: 'us-east-1' })
  const prom = new XAWS.SES({
    apiVersion: '2010-12-01'
  })
  const r = await prom.verifyEmailIdentity({ EmailAddress: email }).promise()

  return r
}
