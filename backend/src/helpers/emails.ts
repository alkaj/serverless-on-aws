import * as AWS from 'aws-sdk'

import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
// TODO: use the logger provided intead of console.log...

export const sendEmail = async (
  subjectText: string,
  emails: string[],
  bodyText: string,
  bodyHTML: string
) => {
  /* The following example sends a formatted email: */
  console.log('sending email ' + bodyText + ' to ' + emails[0])
  XAWS.config.update({ region: 'us-east-1' })
  const params = {
    Destination: {
      ToAddresses: emails
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: bodyHTML
        },
        Text: {
          Charset: 'UTF-8',
          Data: bodyText
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subjectText
      }
    },
    Source: 'contact@walkiwi.com',
    Tags: [
      {
        Name: 'source' /* required */,
        Value: 'AWS' /* required */
      }
      /* more items */
    ]
  }

  const status = await sender(params)
    .then((data) => {
      console.log('email sent')
      return data
    })
    .catch((err) => {
      console.log('error sending email')
      console.log(err)
      return err
    })

  if (status.MessageId) {
    console.log('email sent successfully with id ' + status.MessageId)
  } else {
    console.log('email failed to send')
  }
}

const sender = async (params) => {
  const prom = new XAWS.SES({
    apiVersion: '2010-12-01'
  })
  const r = await prom.sendEmail(params).promise()

  return r
}

export const verifyEmail = async (email: string) => {
  const prom = new XAWS.SES({
    apiVersion: '2010-12-01'
  })
  const r = await prom.verifyEmailIdentity({ EmailAddress: email }).promise()

  return r
}
