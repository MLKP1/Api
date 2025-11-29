import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { orders, pizzas } from '.'
import { createId } from '@paralleldrive/cuid2'

export const orderItems = pgTable('order_items', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),
  itemId: text('item_id').references(() => pizzas.id, {
    onDelete: 'set null',
  }),
  quantity: integer('quantity').default(1),
  priceInCents: integer('price_in_cents').notNull(),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  pizza: one(pizzas, {
    fields: [orderItems.itemId],
    references: [pizzas.id],
  }),
}))
