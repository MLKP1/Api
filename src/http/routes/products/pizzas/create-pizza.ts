import { db } from '@/db/connection'
import { pizzas } from '@/db/schema'
import { authentication } from '@/http/authentication'
import Elysia, { t } from 'elysia'
import { createId } from '@paralleldrive/cuid2'
import { saveImageToS3 } from '@/config/aws-s3'
import { env } from '@/env'

interface CreatePizzaRequest {
  name: string
  description?: string
  price: string
  image: File
  size: 'MEDIUM' | 'LARGE' | 'FAMILY'
  type: 'SWEET' | 'SALTY'
  slug?: string
  active?: string
}

export const createPizza = new Elysia().use(authentication).post(
  '/products/pizzas',
  async ({ body, getCurrentUser, set }) => {
    const { restaurantId } = await getCurrentUser()
    const typedBody = body as CreatePizzaRequest
    const { name, description, image, size, type, slug } = typedBody

    if (!name) {
      set.status = 400
      throw new Error('Name is required.')
    }

    if (typedBody.price === undefined || typedBody.price === '') {
      set.status = 400
      throw new Error('Price is required.')
    }

    if (!image) {
      set.status = 400
      throw new Error('Image is required.')
    }

    if (!size) {
      set.status = 400
      throw new Error('Size is required.')
    }

    if (!type) {
      set.status = 400
      throw new Error('Type is required.')
    }

    const active = typedBody.active === 'false' ? false : true
    const price = parseInt(typedBody.price)
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

      try {
        const arrayBuffer = await image.arrayBuffer()
        await saveImageToS3({ fileName, arrayBuffer, imgType: image.type })
      } catch (err) {
        throw new Error(`Erro ao tentar salvar no S3, ${err}`)
      }

      imagePath = `${env.AWS_ENDPOINT}/${fileName}`
    }

    const [pizza] = await db
      .insert(pizzas)
      .values({
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
      .returning({
        pizzaId: pizzas.id
      })

    set.status = 201

    return { pizzaId: pizza.pizzaId }
  },
)
