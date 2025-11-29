/* eslint-disable drizzle/enforce-delete-with-where */

import {
  authLinks,
  drinks,
  drinkTypesEnum,
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
import { env } from '@/env'

/**
 * Reset database
 */
await db.delete(orderItems)
await db.delete(orders)
await db.delete(evaluations)
await db.delete(products)
await db.delete(pizzas)
await db.delete(drinks)
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
    name: 'Lucas',
    email: 'pizzastars33@gmail.com',
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
    name: 'Pizza Paradise',
    description: 'A melhor pizza da cidade, com ingredientes frescos e sabor incomparável.',
    managerId: manager.id,
  })
  .returning()

console.log(chalk.yellow('✔ Created restaurant'))

type DrinkType = typeof drinkTypesEnum.enumValues[number]

function getRandomDrinkPrice({ type, volume }: { type: DrinkType, volume: number }) {
  let basePrice = 0

  switch (type) {
    case 'SODA':
      basePrice = 3000
      break
    case 'JUICE':
      basePrice = 4000
      break
    case 'ALCOHOLIC':
      basePrice = 8000
      break
    case 'WATER':
      basePrice = 2000
      break
  }

  if (volume > 500) {
    basePrice += 2000
  } else if (volume > 300) {
    basePrice += 1000
  }

  return basePrice
}

await db.insert(drinks)
  .values([
    {
      name: 'Coca-Cola',
      description: 'Refrigerante clássico de cola.',
      price: getRandomDrinkPrice({ type: 'SODA', volume: 350 }),
      image: `${env.AWS_ENDPOINT}/drinks/coca-cola`,
      active: true,
      volume: 350,
      type: 'SODA',
      slug: 'coca-cola-2l',
      restaurantId: restaurant.id,
    },
    {
      name: 'Suco de Laranja 500ml',
      description: 'Suco natural de laranja.',
      price: getRandomDrinkPrice({ type: 'JUICE', volume: 500 }),
      image: `${env.AWS_ENDPOINT}/drinks/suco-laranja`,
      active: true,
      volume: 500,
      type: 'JUICE',
      slug: 'suco-de-laranja-500ml',
      restaurantId: restaurant.id,
    },
    {
      name: 'Cerveja Artesanal 600ml',
      description: 'Cerveja artesanal premium.',
      price: getRandomDrinkPrice({ type: 'ALCOHOLIC', volume: 600 }),
      image: `${env.AWS_ENDPOINT}/drinks/cerveja-artesanal`,
      active: true,
      volume: 600,
      type: 'ALCOHOLIC',
      slug: 'cerveja-artesanal-600ml',
      restaurantId: restaurant.id,
    },
    {
      name: 'Água Mineral 330ml',
      description: 'Água mineral sem gás.',
      price: getRandomDrinkPrice({ type: 'WATER', volume: 330 }),
      image: `${env.AWS_ENDPOINT}/drinks/agua-mineral`,
      active: true,
      volume: 330,
      type: 'WATER',
      slug: 'agua-mineral-330ml',
      restaurantId: restaurant.id,
    },
    {
      name: 'Refrigerante Guaraná 1L',
      description: 'Refrigerante sabor guaraná.',
      price: getRandomDrinkPrice({ type: 'SODA', volume: 1000 }),
      image: `${env.AWS_ENDPOINT}/drinks/guarana-1l`,
      active: true,
      volume: 1000,
      type: 'SODA',
      slug: 'refrigerante-guarana-1l',
      restaurantId: restaurant.id,
    },
    {
      name: 'Suco de Uva Integral 1L',
      description: 'Suco integral de uva.',
      price: getRandomDrinkPrice({ type: 'JUICE', volume: 1000 }),
      image: `${env.AWS_ENDPOINT}/drinks/suco-uva`,
      active: true,
      volume: 1000,
      type: 'JUICE',
      slug: 'suco-de-uva-integral-1l',
      restaurantId: restaurant.id,
    },
    {
      name: 'Vinho Tinto 750ml',
      description: 'Vinho tinto seco de alta qualidade.',
      price: getRandomDrinkPrice({ type: 'ALCOHOLIC', volume: 750 }),
      image: `${env.AWS_ENDPOINT}/drinks/vinho-tinto`,
      active: false,
      volume: 750,
      type: 'ALCOHOLIC',
      slug: 'vinho-tinto-750ml',
      restaurantId: restaurant.id,
    },
    {
      name: 'Água com Gás 500ml',
      description: 'Água mineral com gás.',
      price: getRandomDrinkPrice({ type: 'WATER', volume: 500 }),
      image: `${env.AWS_ENDPOINT}/drinks/agua-com-gas`,
      active: true,
      volume: 500,
      type: 'WATER',
      slug: 'agua-com-gas-500ml',
      restaurantId: restaurant.id,
    },
    {
      name: 'Refrigerante Laranja 2L',
      description: 'Refrigerante sabor laranja.',
      price: getRandomDrinkPrice({ type: 'SODA', volume: 2000 }),
      image: `${env.AWS_ENDPOINT}/drinks/refrigerante-laranja`,
      active: false,
      volume: 2000,
      type: 'SODA',
      slug: 'refrigerante-laranja-2l',
      restaurantId: restaurant.id,
    },
  ])

console.log(chalk.yellow('✔ Created drinks'))

function getRandomPizzaPrice({ size, type }: { size: 'MEDIUM' | 'LARGE' | 'FAMILY', type: 'SWEET' | 'SALTY' }) {
  const basePrice = type === 'SWEET' ? 20000 : 25000

  switch (size) {
    case 'MEDIUM':
      return basePrice
    case 'LARGE':
      return basePrice + 5000
    case 'FAMILY':
      return basePrice + 10000
    default:
      return basePrice
  }
}

function getRandomPizzaImage() {
  const imageKey = 'pexels-pizza-default-'
  const numberIndex = faker.number.int({ min: 1, max: 6 })
  const imageSelected = imageKey + numberIndex
  const imagePath = `https://tcc-api-4279.s3.sa-east-1.amazonaws.com/pizzas/${imageSelected}`

  return imagePath
}

/**
 * Create pizzas
*/
await db.insert(pizzas)
  .values([
    {
      name: 'Margherita',
      description: 'Molho de tomate, mussarela e manjericão fresco.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'margherita',
      restaurantId: restaurant.id,
    },
    {
      name: 'Pepperoni',
      description: 'Molho de tomate, mussarela e pepperoni.',
      price: getRandomPizzaPrice({ size: 'LARGE', type: 'SALTY' }),
      image: getRandomPizzaImage(),
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
      price: getRandomPizzaPrice({ size: 'LARGE', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: false,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'quatro-queijos',
      restaurantId: restaurant.id,
    },
    {
      name: 'Calabresa',
      description: 'Molho de tomate, mussarela e calabresa fatiada.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: false,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'calabresa',
      restaurantId: restaurant.id,
    },
    {
      name: 'Chocolate com Morango',
      description: 'Chocolate ao leite, morangos frescos e leite condensado.',
      price: getRandomPizzaPrice({ size: 'FAMILY', type: 'SWEET' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'FAMILY',
      type: 'SWEET',
      slug: 'chocolate-com-morango',
      restaurantId: restaurant.id,
    },
    {
      name: 'Banana com Canela',
      description: 'Banana fatiada, canela e açúcar.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SWEET' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'banana-com-canela',
      restaurantId: restaurant.id,
    },
    {
      name: 'Frango com Catupiry',
      description: 'Molho de tomate, frango desfiado, catupiry e milho.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'frango-com-catupiry',
      restaurantId: restaurant.id,
    },
    {
      name: 'Portuguesa',
      description: 'Molho de tomate, mussarela, presunto, ovo, cebola e azeitonas.',
      price: getRandomPizzaPrice({ size: 'LARGE', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'portuguesa',
      restaurantId: restaurant.id,
    },
    {
      name: 'Veggie',
      description: 'Molho de tomate, abobrinha, berinjela, pimentão e champignon.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'veggie',
      restaurantId: restaurant.id,
    },
    {
      name: 'Bacon Supreme',
      description: 'Molho de tomate, mussarela, bacon crocante e cebola caramelizada.',
      price: getRandomPizzaPrice({ size: 'FAMILY', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'FAMILY',
      type: 'SALTY',
      slug: 'bacon-supreme',
      restaurantId: restaurant.id,
    },
    {
      name: 'Mexicana',
      description: 'Molho de tomate, carne moída temperada, pimenta jalapeño e nachos.',
      price: getRandomPizzaPrice({ size: 'LARGE', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'mexicana',
      restaurantId: restaurant.id,
    },
    {
      name: 'Atum',
      description: 'Molho de tomate, atum, cebola roxa e azeitonas.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: false,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'atum',
      restaurantId: restaurant.id,
    },
    {
      name: 'Rúcula com Tomate Seco',
      description: 'Molho de tomate, mussarela, rúcula fresca e tomate seco.',
      price: getRandomPizzaPrice({ size: 'LARGE', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'rucula-com-tomate-seco',
      restaurantId: restaurant.id,
    },
    {
      name: 'Nutella com Morango',
      description: 'Nutella, morangos frescos e chocolate granulado.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SWEET' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'nutella-com-morango',
      restaurantId: restaurant.id,
    },
    {
      name: 'Romeu e Julieta',
      description: 'Goiabada cremosa e queijo minas.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SWEET' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'romeu-e-julieta',
      restaurantId: restaurant.id,
    },
    {
      name: 'Camarão',
      description: 'Molho de tomate, mussarela, camarão e cream cheese.',
      price: getRandomPizzaPrice({ size: 'LARGE', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'LARGE',
      type: 'SALTY',
      slug: 'camarao',
      restaurantId: restaurant.id,
    },
    {
      name: 'Brigadeiro',
      description: 'Chocolate cremoso e granulado.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SWEET' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'brigadeiro',
      restaurantId: restaurant.id,
    },
    {
      name: 'Parma',
      description: 'Molho de tomate, mussarela, presunto de parma e rúcula.',
      price: getRandomPizzaPrice({ size: 'FAMILY', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'FAMILY',
      type: 'SALTY',
      slug: 'parma',
      restaurantId: restaurant.id,
    },
    {
      name: 'Alho e Óleo',
      description: 'Molho de tomate, mussarela, alho frito e azeite de oliva.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SALTY' }),
      image: getRandomPizzaImage(),
      active: false,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'alho-e-oleo',
      restaurantId: restaurant.id,
    },
    {
      name: 'Doce de Leite',
      description: 'Doce de leite cremoso, banana e canela.',
      price: getRandomPizzaPrice({ size: 'MEDIUM', type: 'SWEET' }),
      image: getRandomPizzaImage(),
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'doce-de-leite',
      restaurantId: restaurant.id,
    }
  ])

console.log(chalk.yellow('✔ Created pizzas'))

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
