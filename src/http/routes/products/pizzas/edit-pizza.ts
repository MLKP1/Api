import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { env } from '@/env'
import { updateImageToS3 } from '@/config/aws-s3'

interface EditPizzaRequest {
  name: string
  description?: string
  price: string
  image?: File
  size: 'MEDIUM' | 'LARGE' | 'FAMILY'
  type: 'SWEET' | 'SALTY'
  slug?: string
  active?: string
}

export const editPizza = new Elysia().use(authentication).patch(
  '/products/pizza/:id',
  async ({ body, getCurrentUser, set, params}) => {
    const { restaurantId } = await getCurrentUser()
    const { id } = params
    const { name, description, image, size, type, slug } = body as EditPizzaRequest

    if ((body as EditPizzaRequest).price === undefined || (body as EditPizzaRequest).price === '') {
      set.status = 400
      throw new Error('Price is required.')
    }

    const price = Number.parseFloat((body as EditPizzaRequest).price)
    const active = (body as EditPizzaRequest).active === 'false' ? false : true

    if (!name) {
      set.status = 400
      throw new Error('Name is required.')
    }

    if (!size) {
      set.status = 400
      throw new Error('Size is required.')
    }

    if (!type) {
      set.status = 400
      throw new Error('Type is required.')
    }

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

    if (image) {
      const imageKey = `${doesExistPizza.name.toLowerCase().replace(/\s+/g, '-')}-${doesExistPizza.id}`
      const imagePath = `${env.AWS_ENDPOINT}/${imageKey}`

      try {
        const arrayBuffer = await image.arrayBuffer()
        await updateImageToS3({ imageKey, arrayBuffer, imgType: image.type })
      } catch (err) {
        throw new Error(`Erro ao tentar atualizar imagem, ${err}`)
      }

      await db.update(pizzas).set({image: imagePath}).where(eq(pizzas.id, id))
    }

    await db.update(pizzas)
      .set({
        name,
        description,
        price,
        size,
        type,
        slug,
        active,
        restaurantId,
      })
      .where(eq(pizzas.id, id))

    set.status = 204
  }
)
