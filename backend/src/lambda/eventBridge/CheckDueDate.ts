import { sendEmail } from '../../helpers/emails'
export const handler = async () => {
  console.log('Sending checking update to alkaj09@gmail.com')
  await sendExpiringSoonEmail(['alkaj@walkity.com'])
}

const sendExpiringSoonEmail = async (emails: string[]) => {
  await sendEmail(
    'Task due in less than 24 hours!',
    emails,
    'Hi, this is a gentle reminder that at least one of your tasks is due in less than 24 hours, please check it out.',
    `<h1>Hello,</h1><p>This is a gentle reminder that at least one of your tasks is due in less than 24 hours, please check it out.</p><br><p>Thanks,</p><p>Your KAJ-ToDo-s bot</p>`
  )
}
