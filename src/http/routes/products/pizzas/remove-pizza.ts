import Elysia, { t } from 'elysia'
import { authentication } from '../../../authentication'
import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { deleteImageToS3 } from '@/config/aws-s3'

export const removePizza = new Elysia().use(authentication).delete(
  '/products/pizzas/:id',
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

    await db
      .delete(pizzas)
      .where(eq(pizzas.id, pizzaId))

    try {
      await deleteImageToS3({ imageKey: `${pizza.name.toLowerCase().replace(/\s+/g, '-')}-${pizza.id}` })
    } catch (err) {
      throw new Error(`Erro ao tentar deletar uma imagem no S3, ${err}`)
    }

    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)
