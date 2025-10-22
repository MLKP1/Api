import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { restaurants } from './restaurants'
import { orderItems } from './order-items'

export const drinkTypesEnum = pgEnum('drink_types', [
  'SODA',
  'JUICE',
  'ALCOHOLIC',
  'WATER'
])

export const drinks = pgTable('drinks', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  active: boolean('active').default(true).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  image: text('image'),
  volume: integer('volume').notNull(),
  type: drinkTypesEnum('type').notNull(),
  slug: text('slug').unique(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  restaurantId: text('restaurant_id')
    .references(() => restaurants.id, {
      onDelete: 'cascade'
    })
    .notNull(),
})

export const drinksRelations = relations(drinks, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [drinks.restaurantId],
    references: [restaurants.id],
    relationName: 'drinkRestaurant',
  }),
  orderItems: many(orderItems)
}))
