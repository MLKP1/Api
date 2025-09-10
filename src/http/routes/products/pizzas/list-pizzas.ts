import { db } from '@/db/connection'
import { pizzas, restaurants } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { and, count, desc, eq, ilike, sql } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const listAllPizzas = new Elysia().use(authentication).get(
  '/products/pizzas',
  async ({ query, getCurrentUser, set }) => {
    const { restaurantId } = await getCurrentUser()
    const { pageIndex = 0, active, id, name, description } = query

    if (!restaurantId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const baseQuery = db
      .select({
        pizzaId: pizzas.id,
        active: pizzas.active,
        name: pizzas.name,
        description: pizzas.description,
        price: pizzas.price,
        image: pizzas.image,
        size: pizzas.size,
        type: pizzas.type,
        slug: pizzas.slug,
        createdAt: pizzas.createdAt,
        updatedAt: pizzas.updatedAt,
        restaurantName: restaurants.name
      })
      .from(pizzas)
      .innerJoin(restaurants, eq(restaurants.id, pizzas.restaurantId))
      .where(
        and(
          eq(pizzas.restaurantId, restaurantId),
          id ? ilike(pizzas.id, `%${id}%`) : undefined,
          active !== undefined ? eq(pizzas.active, active) : undefined,
          name ? ilike(pizzas.name, `%${name}%`) : undefined,
          description ? ilike(pizzas.description, `%${description}%`) : undefined
        )
      )

    const [pizzasCount] = await db
      .select({ count: count() })
      .from(baseQuery.as('baseQuery'))

    const allPizzas = await baseQuery
      .offset(pageIndex * 10)
      .limit(10)
      .orderBy((fields) => {
        return [
          sql`CASE WHEN ${fields.active} = true THEN 1 ELSE 2 END`,
          desc(fields.createdAt),
        ]
      })

    const result = {
      pizzas: allPizzas,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: pizzasCount.count,
      },
    }

    return result
  },
  {
    query: t.Object({
      pageIndex: t.Optional(t.Numeric({ minimum: 0 })),
      active: t.Optional(t.BooleanString()),
      id: t.Optional(t.String()),
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
    }),
  },
)
