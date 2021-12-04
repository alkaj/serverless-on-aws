import { sender } from "../helpers/emails"

export const sendEmail = async (
  subjectText: string,
  emails: string[],
  bodyText: string,
  bodyHTML: string
) => {
  /* The following example sends a formatted email: */
  console.log('sending email ' + bodyText + ' to ' + emails[0])
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