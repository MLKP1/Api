/* eslint-disable drizzle/enforce-delete-with-where */

import {
  authLinks,
  evaluations,
  orders,
  pizzas,
  products,
  restaurants,
  users,
} from './schema'
import { faker } from '@faker-js/faker'
import { db } from './connection'
import chalk from 'chalk'
import { orderItems } from './schema/order-items'
import { createId } from '@paralleldrive/cuid2'

/**
 * Reset database
 */
await db.delete(orderItems)
await db.delete(orders)
await db.delete(evaluations)
await db.delete(products)
await db.delete(restaurants)
await db.delete(authLinks)
await db.delete(users)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create customers
 */
const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

console.log(chalk.yellow('✔ Created customers'))

/**
 * Create restaurant manager
 */
const [manager] = await db
  .insert(users)
  .values({
    name: faker.person.fullName(),
    email: 'diego.schell.f@gmail.com',
    role: 'manager',
  })
  .returning()

console.log(chalk.yellow('✔ Created manager'))

/**
 * Create restaurant
 */
const [restaurant] = await db
  .insert(restaurants)
  .values({
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  })
  .returning()

console.log(chalk.yellow('✔ Created restaurant'))

/**
 * Create pizzas
*/
await db.insert(pizzas)
  .values([
    {
      name: 'Margherita',
      description: 'Molho de tomate, mussarela e manjericão fresco.',
      price: 1999,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'margherita',
      restaurantId: restaurant.id,
    },
    {
      name: 'Pepperoni',
      description: 'Molho de tomate, mussarela e pepperoni.',
      price: 2499,
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'pepperoni',
      restaurantId: restaurant.id,
    },
    {
      name: 'Quatro Queijos',
      description:
        'Molho de tomate, mussarela, gorgonzola, parmesão e catupiry.',
      price: 2799,
      active: false,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'quatro-queijos',
      restaurantId: restaurant.id,
    },
    {
      name: 'Calabresa',
      description: 'Molho de tomate, mussarela e calabresa fatiada.',
      price: 2299,
      active: false,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'calabresa',
      restaurantId: restaurant.id,
    },
    {
      name: 'Chocolate com Morango',
      description: 'Chocolate ao leite, morangos frescos e leite condensado.',
      price: 1999,
      active: true,
      size: 'FAMILY',
      type: 'SWEET',
      slug: 'chocolate-com-morango',
      restaurantId: restaurant.id,
    },
    {
      name: 'Banana com Canela',
      description: 'Banana fatiada, canela e açúcar.',
      price: 1799,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'banana-com-canela',
      restaurantId: restaurant.id,
    },
    {
      name: 'Frango com Catupiry',
      description: 'Molho de tomate, frango desfiado, catupiry e milho.',
      price: 2499,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'frango-com-catupiry',
      restaurantId: restaurant.id,
    },
    {
      name: 'Portuguesa',
      description: 'Molho de tomate, mussarela, presunto, ovo, cebola e azeitonas.',
      price: 2599,
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'portuguesa',
      restaurantId: restaurant.id,
    },
    {
      name: 'Veggie',
      description: 'Molho de tomate, abobrinha, berinjela, pimentão e champignon.',
      price: 2399,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'veggie',
      restaurantId: restaurant.id,
    },
    {
      name: 'Bacon Supreme',
      description: 'Molho de tomate, mussarela, bacon crocante e cebola caramelizada.',
      price: 2699,
      active: true,
      size: 'FAMILY',
      type: 'SALTY',
      slug: 'bacon-supreme',
      restaurantId: restaurant.id,
    },
    {
      name: 'Mexicana',
      description: 'Molho de tomate, carne moída temperada, pimenta jalapeño e nachos.',
      price: 2799,
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'mexicana',
      restaurantId: restaurant.id,
    },
    {
      name: 'Atum',
      description: 'Molho de tomate, atum, cebola roxa e azeitonas.',
      price: 2399,
      active: false,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'atum',
      restaurantId: restaurant.id,
    },
    {
      name: 'Rúcula com Tomate Seco',
      description: 'Molho de tomate, mussarela, rúcula fresca e tomate seco.',
      price: 2599,
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'rucula-com-tomate-seco',
      restaurantId: restaurant.id,
    },
    {
      name: 'Nutella com Morango',
      description: 'Nutella, morangos frescos e chocolate granulado.',
      price: 2899,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'nutella-com-morango',
      restaurantId: restaurant.id,
    },
    {
      name: 'Romeu e Julieta',
      description: 'Goiabada cremosa e queijo minas.',
      price: 2199,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'romeu-e-julieta',
      restaurantId: restaurant.id,
    },
    {
      name: 'Camarão',
      description: 'Molho de tomate, mussarela, camarão e cream cheese.',
      price: 3299,
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'camarao',
      restaurantId: restaurant.id,
    },
    {
      name: 'Brigadeiro',
      description: 'Chocolate cremoso e granulado.',
      price: 2199,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'brigadeiro',
      restaurantId: restaurant.id,
    },
    {
      name: 'Parma',
      description: 'Molho de tomate, mussarela, presunto de parma e rúcula.',
      price: 3099,
      active: true,
      size: 'FAMILY',
      type: 'SALTY',
      slug: 'parma',
      restaurantId: restaurant.id,
    },
    {
      name: 'Alho e Óleo',
      description: 'Molho de tomate, mussarela, alho frito e azeite de oliva.',
      price: 2199,
      active: false,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'alho-e-oleo',
      restaurantId: restaurant.id,
    },
    {
      name: 'Doce de Leite',
      description: 'Doce de leite cremoso, banana e canela.',
      price: 2299,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'doce-de-leite',
      restaurantId: restaurant.id,
    }
  ])

/**
 * Create products
 */
const availableProducts = await db
  .insert(products)
  .values([
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
    {
      name: faker.commerce.productName(),
      priceInCents: Number(
        faker.commerce.price({
          min: 190,
          max: 490,
          dec: 0,
        }),
      ),
      restaurantId: restaurant.id,
      description: faker.commerce.productDescription(),
    },
  ])
  .returning()

console.log(chalk.yellow('✔ Created products'))

const ordersToInsert: (typeof orders.$inferInsert)[] = []
const orderItemsToPush: (typeof orderItems.$inferInsert)[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()

  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({
      min: 1,
      max: 3,
    })

    totalInCents += orderProduct.priceInCents * quantity

    orderItemsToPush.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  })

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: restaurant.id,
    status: faker.helpers.arrayElement([
      'pending',
      'canceled',
      'processing',
      'delivering',
      'delivered',
    ]),
    totalInCents,
    createdAt: faker.date.recent({
      days: 40,
    }),
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToPush)

console.log(chalk.yellow('✔ Created orders'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
