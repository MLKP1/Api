import { users } from '@/db/schema'
import { db } from '@/db/connection'
import Elysia, { t } from 'elysia'

export const registerCustomer = new Elysia().post(
  '/customers',
  async ({ body, set }) => {
    const { name, phone, email } = body

    await db.insert(users).values({
      name,
      email,
      phone,
    })

    set.status = 401
  },
  {
    body: t.Object({
      name: t.String(),
      phone: t.String(),
      email: t.String({ format: 'email' })
    })
  },
)
