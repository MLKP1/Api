import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const editPizza = new Elysia().use(authentication).put(
  '/products/pizza/:id',
  async ({ body, getCurrentUser, set, params}) => {
    const { restaurantId } = await getCurrentUser()
    const { id } = params
    const { name, description, price, image, size, type, slug, active } = body

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const doesExistPizza = await db.query.pizzas.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    })

    if (!doesExistPizza) {
      set.status = 400
      throw new Error('Pizza does not exists.')
    }

    const doesSlugExist = await db.query.pizzas.findFirst({
      where: (fields, { and, eq, ne }) =>
        and(
          ne(fields.id, id),
          eq(fields.slug, slug ?? '')
        ),
    })

    if (doesSlugExist) {
      set.status = 400
      throw new Error('Pizza with this slug already exists.')
    }

    await db.update(pizzas)
      .set({
        name,
        description,
        price,
        image,
        size,
        type,
        slug,
        active,
        restaurantId,
      })
      .where(eq(pizzas.id, id))

    set.status = 204
  },
  {
    body: t.Object({
      name: t.String({ minLength: 5 }),
      description: t.Optional(t.String()),
      price: t.Integer({ minimum: 100 }),
      image: t.Optional(t.String()),
      size: t.Enum({ MEDIUM: 'MEDIUM', LARGE: 'LARGE', FAMILY: 'FAMILY' }),
      type: t.Enum({ SWEET: 'SWEET', SALTY: 'SALTY' }),
      slug: t.Optional(t.String()),
      active: t.Boolean(),
    }),
    params: t.Object({
      id: t.String(),
    }),
  }
)
