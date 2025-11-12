import Elysia, { t } from 'elysia'
import { authentication } from '../../../authentication'
import { db } from '@/db/connection'
import { drinks } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const disableDrink = new Elysia().use(authentication).patch(
  '/products/drinks/:id/disable',
  async ({ getCurrentUser, set, params }) => {
    const { id: drinkId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const drink = await db.query.drinks.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, drinkId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!drink) {
      set.status = 401

      throw new Error('Drink not found under the user managed restaurant.')
    }

    if (drink.active === false) {
      set.status = 400

      return { message: 'This drink is already disabled.' }
    }

    await db
      .update(drinks)
      .set({
        active: false,
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
