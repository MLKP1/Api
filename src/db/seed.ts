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

/**
 * Create pizzas
*/
const imagePath = 'https://tcc-api-4279.s3.sa-east-1.amazonaws.com'
const minPrice = 5000
const maxPrice = 9000
const availablePizzas = await db.insert(pizzas)
  .values([
    {
      name: 'The Rock',
      description: 'the pedra the gostoso main',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/4-queijo`,
      active: false,
      size: 'FAMILY',
      type: 'SWEET',
      slug: 'the-rock',
      restaurantId: restaurant.id,
    },
    {
      name: 'Pistache',
      description: 'Coberta com creme de pistache.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/pistache`,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'pistache',
      restaurantId: restaurant.id,
    },
    {
      name: 'Ovomaltine',
      description:
        'Recheada com creme de baunilha e creme de ovomaltine crocante.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/ovomaltine`,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'ovomaltine',
      restaurantId: restaurant.id,
    },
    {
      name: 'Nutella',
      description: 'Pizza recheada de Nutella.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/nutella`,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'nutella',
      restaurantId: restaurant.id,
    },
    {
      name: 'M&Ms',
      description: 'Recheada com creme de baunilha, brigadeiro de chocolate e M&Ms.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/m&ms`,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'm&ms',
      restaurantId: restaurant.id,
    },
    {
      name: 'Churros',
      description: 'Doce de leite, coberta de açúcar e canela.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/churros`,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'churros',
      restaurantId: restaurant.id,
    },
    {
      name: 'Brigadeiro',
      description: 'Brigadeiro com creme de baunilha ,brigadeiro de chocolate e granulado.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/brigadeiro`,
      active: true,
      size: 'MEDIUM',
      type: 'SWEET',
      slug: 'brigadeiro',
      restaurantId: restaurant.id,
    },
    {
      name: 'Pepperoni',
      description: 'Queijo, oregano e pepperoni.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/pepperoni`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'pepperoni',
      restaurantId: restaurant.id,
    },
    {
      name: 'La Bianca',
      description: 'Queijo, muçarela de vaca e búfala, requeijão, parmesão ralado, orégano e manjericão.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/la-bianca`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'la-bianca',
      restaurantId: restaurant.id,
    },
    {
      name: 'Calabresa',
      description: 'Queijo, calabresa e cebola, oregano.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/calabresa`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'calabresa',
      restaurantId: restaurant.id,
    },
    {
      name: '4 Queijos',
      description: 'Queijo, requeijão, gorgonzola, oregano e parmesão ralado.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/4-queijos`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: '4-queijos',
      restaurantId: restaurant.id,
    },
    {
      name: 'Carne Seca com Cream Cheese',
      description: 'Carne Seca com Cream Cheese',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/carne-seca-com-cream-cheese`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'carne-seca-com-cream-cheese',
      restaurantId: restaurant.id,
    },
    {
      name: 'Cheddar & Bacon',
      description: 'Queijo, molho sabor queijo cheddar, bacon e orégano.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/cheddar-&-bacon`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'cheddar-&-bacon',
      restaurantId: restaurant.id,
    },
    {
      name: 'Veggie',
      description: 'Queijo, champignon, azeitona preta, cebola, oregano e pimentão verde.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/veggie`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'veggie',
      restaurantId: restaurant.id,
    },
    {
      name: 'Portuguesa',
      description: 'Queijo, presunto, ovo de codorna, azeitona preta, cebola, oregano e pimentão verde.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/portuguesa`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'portuguesa',
      restaurantId: restaurant.id,
    },
    {
      name: 'Frango Caipira',
      description: 'Queijo, frango desfiado, milho, catupiry e orégano.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/frango-caipira`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'frango-caipira',
      restaurantId: restaurant.id,
    },
    {
      name: 'Margherita',
      description: 'Queijo, tomate, oregano e manjericão.',
      price: Number(
        faker.commerce.price({
          min: minPrice,
          max: maxPrice,
          dec: 0,
      })),
      image: `${imagePath}/margherita`,
      active: true,
      size: 'MEDIUM',
      type: 'SALTY',
      slug: 'margherita',
      restaurantId: restaurant.id,
    },
  ])
  .returning()

console.log(chalk.yellow('✔ Created pizzas'))

/**
 * Create products
 */
await db
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

console.log(chalk.yellow('✔ Created products'))

const ordersToInsert: (typeof orders.$inferInsert)[] = []
const orderItemsToPush: (typeof orderItems.$inferInsert)[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()

  const orderPizzas = faker.helpers.arrayElements(availablePizzas, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderPizzas.forEach((orderPizza) => {
    const quantity = faker.number.int({
      min: 1,
      max: 3,
    })

    totalInCents += orderPizza.price * quantity

    orderItemsToPush.push({
      orderId,
      itemId: orderPizza.id,
      priceInCents: orderPizza.price,
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
