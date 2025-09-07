import {
  authLinks,
  evaluations,
  orderItems,
  orders,
  pizzas,
  products,
  restaurants,
  users,
} from './schema'
import { db } from './connection'
import chalk from 'chalk'

await db.delete(orderItems)
await db.delete(orders)
await db.delete(evaluations)
await db.delete(pizzas)
await db.delete(products)
await db.delete(restaurants)
await db.delete(authLinks)
await db.delete(users)

console.log(chalk.greenBright('Database reset complete'))
process.exit(0)
