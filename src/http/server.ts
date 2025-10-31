import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

import { getMonthReceipt, getMonthOrdersAmount, getDayOrdersAmount, getMonthCanceledOrdersAmount, getDailyReceiptInPeriod, getPopularProducts } from './routes/metrics'
import { createOrder, approveOrder, cancelOrder, dispatchOrder, deliverOrder, getOrders, getOrderDetails } from './routes/orders'
import { sendAuthenticationLink, authenticateFromLink, signOut } from './routes/auth'
import { registerRestaurant, getManagedRestaurant } from './routes/restaurants'
import { createEvaluation, getEvaluations } from './routes/evaluations'
import { registerCustomer, getProfile, updateProfile } from './routes/customers'
import { createPizza, listAllPizzas, activePizza, disablePizza, editPizza, removePizza } from './routes/products/pizzas'
import { listAllDrinks, removeDrink } from './routes/products/drinks'

import { updateMenu } from './routes/update-menu'
import { authentication } from './authentication'

const metricGroup = new Elysia()
  .use(getMonthReceipt)
  .use(getMonthOrdersAmount)
  .use(getDayOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getDailyReceiptInPeriod)
  .use(getPopularProducts)

const orderGroup = new Elysia()
  .use(createOrder)
  .use(approveOrder)
  .use(cancelOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(getOrders)
  .use(getOrderDetails)

const authGroup = new Elysia()
  .use(sendAuthenticationLink)
  .use(authenticateFromLink)
  .use(signOut)

const restaurantGroup = new Elysia()
  .use(registerRestaurant)
  .use(getManagedRestaurant)

const evaluationGroup = new Elysia()
  .use(createEvaluation)
  .use(getEvaluations)

const customerGroup = new Elysia()
  .use(registerCustomer)
  .use(getProfile)
  .use(updateProfile)

const pizzaGroup = new Elysia()
  .use(createPizza)
  .use(listAllPizzas)
  .use(activePizza)
  .use(disablePizza)
  .use(editPizza)
  .use(removePizza)

const drinkGroup = new Elysia()
  .use(listAllDrinks)
  .use(removeDrink)

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type', 'authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: (request): boolean => {
        const origin = request.headers.get('origin')

        if (!origin) {
          return false
        }

        return true
      },
    }),
  )
  .use(authentication)
  .use(updateMenu)
  .use(authGroup)
  .use(customerGroup)
  .use(restaurantGroup)
  .use(orderGroup)
  .use(evaluationGroup)
  .use(metricGroup)
  .use(pizzaGroup)
  .use(drinkGroup)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status

        return error.toResponse()
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(3333)

console.log(
  `🔥 HTTP server running at ${app.server?.hostname}:${app.server?.port}`,
)
