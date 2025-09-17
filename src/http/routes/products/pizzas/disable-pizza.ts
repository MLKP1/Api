import Elysia, { t } from 'elysia'
import { authentication } from '../../../authentication'
import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const disablePizza = new Elysia().use(authentication).patch(
  '/products/pizzas/:id/disable',
  async ({ getCurrentUser, set, params }) => {
    const { id: pizzaId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const pizza = await db.query.pizzas.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, pizzaId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!pizza) {
      set.status = 401

      throw new Error('Pizza not found under the user managed restaurant.')
    }

    if (pizza.active === false) {
      set.status = 400

      return { message: 'This pizza is already disabled.' }
    }

    await db
      .update(pizzas)
      .set({
        active: false,
      })
      .where(eq(pizzas.id, pizzaId))

    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)
