import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, boolean, integer, pgEnum, timestamp } from 'drizzle-orm/pg-core'
import { restaurants } from './restaurants'
import { orderItems } from './order-items'

export const pizzaSizesEnum = pgEnum('pizza_sizes', [
  'MEDIUM',
  'LARGE',
  'FAMILY'
])

export const pizzaTypesEnum = pgEnum('pizza_types', [
  'SWEET',
  'SALTY'
])

export const pizzas = pgTable('pizzas', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  active: boolean('active').default(true).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  image: text('image'),
  size: pizzaSizesEnum('size').notNull(),
  type: pizzaTypesEnum('type').notNull(),
  slug: text('slug').unique(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  restaurantId: text('restaurant_id')
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    })
    .notNull()
})

export const pizzasRelations = relations(pizzas, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [pizzas.restaurantId],
    references: [restaurants.id],
    relationName: 'pizzaRestaurant',
  }),
  orderItems: many(orderItems),
}))
