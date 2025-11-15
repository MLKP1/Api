import Elysia, { t } from 'elysia'
import { db } from '@/db/connection'
import { authLinks } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { render } from '@react-email/render'
import { gmail } from '@/mail/client'
import { AuthenticationMagicLinkTemplate } from '@/mail/templates/authentication-magic-link'
import { env } from '@/env'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { UnableToSendEmailError } from '../errors/unable-to-send-email-error'

export const sendAuthenticationLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      throw new UnauthorizedError()
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    console.log(authLink.toString())

    /* await resend.emails.send({
      from: 'Pizza Shop <pizza-shop@resend.dev>',
      to: email,
      subject: '[Pizza Shop] Link para login',
      react: AuthenticationMagicLinkTemplate({
        userEmail: email,
        authLink: authLink.toString(),
      }),
    }) */
 
    try {
      console.time('gmail')
      await gmail.post({
        subject: '[Pizza Shop] Link para login gmail',
        to: email,
        html: render(
          AuthenticationMagicLinkTemplate({
            userEmail: email,
            authLink: authLink.toString(),
          })
        ),
      })
    } catch (err) {
      console.error(`err ---\n${err}`)
      throw new UnableToSendEmailError()
    } finally {
      console.timeEnd('gmail')
    }
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
