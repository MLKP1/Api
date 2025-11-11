import { db } from '@/db/connection'
import { drinks } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import { Elysia } from 'elysia'
import { env } from '@/env'
import { updateImageToS3 } from '@/config/aws-s3'

interface EditDrinkRequest {
  name: string
  description?: string
  price: string
  image?: File
  volume: number
  type: 'SODA' | 'JUICE' | 'ALCOHOLIC' | 'WATER'
  slug?: string
  active?: string
}

export const editDrink = new Elysia().use(authentication).patch(
  '/products/drink/:id',
  async ({ body, getCurrentUser, set, params }) => {
    const { restaurantId } = await getCurrentUser()
    const { id } = params
    const { name, description, image, volume, type, slug } = body as EditDrinkRequest

    if ((body as EditDrinkRequest).price === undefined || (body as EditDrinkRequest).price === '') {
      set.status = 400
      throw new Error('Price is required.')
    }

    const price = Number.parseFloat((body as EditDrinkRequest).price)
    const active = (body as EditDrinkRequest).active === 'false' ? false : true

    if (!name) {
      set.status = 400
      throw new Error('Name is required.')
    }

    if (!volume) {
      set.status = 400
      throw new Error('Volume is required.')
    }

    if (!type) {
      set.status = 400
      throw new Error('Type is required.')
    }

    if (!restaurantId) {
      set.status = 401
      throw new Error('User is not a restaurant manager.')
    }

    const doesExistDrink = await db.query.drinks.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    })

    if (!doesExistDrink) {
      set.status = 404
      throw new Error('Drink not found.')
    }

    const doesSlugExist = await db.query.drinks.findFirst({
      where: (fields, { and, eq, ne }) =>
        and(
          ne(fields.id, id),
          eq(fields.slug, slug ?? '')
        ),
    })

    if (doesSlugExist) {
      set.status = 400
      throw new Error('Drink with this slug already exists.')
    }

    if (image) {
      const imageKey = `${doesExistDrink.name.toLowerCase().replace(/\s+/g, '-')}-${doesExistDrink.id}`
      const imagePath = `${env.AWS_ENDPOINT}/${imageKey}`

      try {
        const arrayBuffer = await image.arrayBuffer()
        await updateImageToS3({ imageKey, arrayBuffer, imgType: image.type })
      } catch (err) {
        throw new Error(`Erro ao tentar atualizar imagem, ${err}`)
      }

      await db.update(drinks).set({image: imagePath}).where(eq(drinks.id, id))
    }

    await db.update(drinks)
      .set({
        name,
        description,
        price,
        volume,
        type,
        slug,
        active,
        restaurantId,
      })
      .where(eq(drinks.id, id))

    set.status = 204
  }
)
