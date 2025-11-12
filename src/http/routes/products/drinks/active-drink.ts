import Elysia, { t } from 'elysia'
import { authentication } from '../../../authentication'
import { db } from '@/db/connection'
import { drinks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from '../../errors/unauthorized-error'

export const activeDrink = new Elysia().use(authentication).patch(
  '/products/drinks/:id/active',
  async ({ getManagedRestaurantId, set, params }) => {
    const { id: drinkId } = params
    const restaurantId = await getManagedRestaurantId()

    const drink = await db.query.drinks.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, drinkId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!drink) {
      throw new UnauthorizedError()
    }

    if (drink.active === true) {
      set.status = 400

      return { message: 'Drink is already activated.' }
    }

    await db
      .update(drinks)
      .set({
        active: true,
      })
      .where(eq(drinks.id, drinkId))

    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)
