import Elysia from 'elysia'
import { authentication } from '../../authentication'
import { and, count, eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { orderItems, orders, pizzas } from '@/db/schema'

export const getPopularProducts = new Elysia()
  .use(authentication)
  .get('/metrics/popular-products', async ({ getManagedRestaurantId }) => {
    const restaurantId = await getManagedRestaurantId()

    try {
      const popularProducts = await db
        .select({
          product: pizzas.name,
          amount: count(orderItems.id),
        })
        .from(orderItems)
        .leftJoin(orders, eq(orders.id, orderItems.orderId))
        .leftJoin(pizzas, eq(pizzas.id, orderItems.itemId))
        .where(and(eq(orders.restaurantId, restaurantId)))
        .groupBy(pizzas.name)
        .limit(5)

      return popularProducts
    } catch (err) {
      console.log(err)
    }
  })
