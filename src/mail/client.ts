import { env } from '@/env'
import { createTransport } from 'nodemailer'
// import { Resend } from 'resend'

// export const resend = new Resend(env.RESEND_API_KEY)

const gmailTransport = createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_PASS,
  },
})

interface SendMailProps {
  from?: string
  to: string
  subject: string
  text?: string
  html?: string
}

export const gmail = {
  async post({ from, to, subject, text, html }: SendMailProps) {
    await gmailTransport.sendMail({
      from: `Pizza Shop <${from ?? env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    })
  },
}
