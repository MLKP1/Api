import { db } from '@/db/connection'
import { drinks, restaurants } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { and, count, desc, eq, ilike, sql } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

export const listAllDrinks = new Elysia().use(authentication).get(
  '/products/drinks',
  async ({ query, getCurrentUser, set } ) => {
    const { restaurantId } = await getCurrentUser()
    const { pageIndex = 0, active, id, name, description } = query

    if (!restaurantId) {
      set.status = 401
      throw new Error('User is not a restaurant manager.')
    }

    const baseQuery = db
      .select({
        drinkId: drinks.id,
        active: drinks.active,
        name: drinks.name,
        description: drinks.description,
        price: drinks.price,
        image: drinks.image,
        volume: drinks.volume,
        type: drinks.type,
        slug: drinks.slug,
        createdAt: drinks.createdAt,
        updatedAt: drinks.updatedAt,
      })
      .from(drinks)
      .where(
        and(
          eq(drinks.restaurantId, restaurantId),
          id ? ilike(drinks.id, `%${id}%`) : undefined,
          active !== undefined ? eq(drinks.active, active) : undefined,
          name ? ilike(drinks.name, `%${name}%`) : undefined,
          description ? ilike(drinks.description, `%${description}%`) : undefined
        )
      )

    const [drinksCount] = await db
      .select({ count: count() })
      .from(baseQuery.as('baseQuery'))

    const allDrinks = await baseQuery
      .offset(pageIndex * 10)
      .limit(10)
      .orderBy((fields) => {
        return [
          sql`CASE WHEN ${fields.active} = true THEN 1 ELSE 2 END`,
          desc(fields.createdAt),
        ]
      })

    const result = {
      drinks: allDrinks,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: drinksCount.count,
      }
    }

    set.status = 200
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