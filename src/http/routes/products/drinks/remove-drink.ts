import { Elysia, t } from 'elysia'
import { authentication } from '@/http/authentication'
import { db } from '@/db/connection'
import { drinks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { deleteImageToS3 } from '@/config/aws-s3'

export const removeDrink = new Elysia().use(authentication).delete(
  '/products/drinks/:id',
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

    await db
      .delete(drinks)
      .where(eq(drinks.id, drinkId))

    try {
      await deleteImageToS3({ imageKey: `${drink.name.toLowerCase().replace(/\s+/g, '-')}-${drink.id}` })
    } catch (err) {
      throw new Error(`Erro ao tentar deletar uma imagem no S3, ${err}`)
    }

    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    })
  }
)