import { users } from '@/db/schema'
import { db } from '@/db/connection'
import Elysia, { t } from 'elysia'
import { eq } from 'drizzle-orm'

export const registerManager = new Elysia().post(
  '/managers',
  async ({ body, set }) => {
    const { name, phone, email } = body

    const userWithSameEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (userWithSameEmail.length > 0) {
      set.status = 400
      return {
        message: 'Este email já está em uso',
      }
    }

    await db.insert(users).values({
      name,
      email,
      phone,
      role: 'manager',
    })

    set.status = 201
  },
  {
    body: t.Object({
      name: t.String(),
      phone: t.String(),
      email: t.String({ format: 'email' })
    }),
    response: {
      201: t.Undefined(),
      400: t.Object({
        message: t.String({ examples: 'email já em uso' }),
      }),
    },
  },
)
