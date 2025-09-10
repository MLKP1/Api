import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { authentication } from '@/http/authentication'
import Elysia, { t } from 'elysia'

export const createPizza = new Elysia().use(authentication).post(
  '/products/pizzas',
  async ({ body, getCurrentUser, set}) => {
    const { restaurantId } = await getCurrentUser()
    const { name, description, price, image, size, type, slug, active = true } = body

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    if (!name.trim()) {
      set.status = 400
      throw new Error('Pizza name cannot be empty or only whitespace.')
    }

    const doesSlugExist = await db.query.pizzas.findFirst({
      where: (fields, { eq }) => eq(fields.slug, slug ?? ''),
    })

    if (doesSlugExist) {
      set.status = 400
      throw new Error('Pizza with this slug already exists.')
    }

    await db.insert(pizzas).values({
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

    set.status = 201
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
      active: t.Optional(t.Boolean({ default: true })),
    })
  }
)
