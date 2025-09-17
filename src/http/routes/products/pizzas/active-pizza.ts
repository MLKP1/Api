import Elysia, { t } from 'elysia'
import { authentication } from '../../../authentication'
import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from '../../errors/unauthorized-error'

export const activePizza = new Elysia().use(authentication).patch(
  '/products/pizzas/:id/active',
  async ({ getManagedRestaurantId, set, params }) => {
    const { id: pizzaId } = params
    const restaurantId = await getManagedRestaurantId()

    const pizza = await db.query.pizzas.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, pizzaId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!pizza) {
      throw new UnauthorizedError()
    }

    if (pizza.active === true) {
      set.status = 400

      return { message: 'Pizza is already activated.' }
    }

    await db
      .update(pizzas)
      .set({
        active: true,
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
