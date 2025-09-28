import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { authentication } from '@/http/authentication'
import Elysia, { t } from 'elysia'
import { createId } from '@paralleldrive/cuid2'

export const createPizza = new Elysia().use(authentication).post(
  '/products/pizzas',
  async ({ body, getCurrentUser, set }) => {
    const { restaurantId } = await getCurrentUser()
    const { name, description, image, size, type, slug, active = true } = body
    const price = parseInt(body.price)
    const id = createId()

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

    let imagePath = null
    if (image) {
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${id}`
      const fileType = image.type.split('/')[1]

      const filePath = `uploads/${fileName}.${fileType}`
      await Bun.write(filePath, image)

      imagePath = `images/${fileName}.${fileType}`
    }

    await db.insert(pizzas).values({
      id,
      name,
      description,
      price,
      image: imagePath,
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
      price: t.String(),
      image: t.File({ type: 'image' }),
      size: t.Enum({ MEDIUM: 'MEDIUM', LARGE: 'LARGE', FAMILY: 'FAMILY' }),
      type: t.Enum({ SWEET: 'SWEET', SALTY: 'SALTY' }),
      slug: t.Optional(t.String()),
      active: t.Optional(t.Boolean({ default: true })),
    }),
    type: 'multipart/form-data'
  }
)
