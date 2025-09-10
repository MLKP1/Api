import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

import { getMonthReceipt, getMonthOrdersAmount, getDayOrdersAmount, getMonthCanceledOrdersAmount, getDailyReceiptInPeriod, getPopularProducts } from './routes/metrics'
import { createOrder, approveOrder, cancelOrder, dispatchOrder, deliverOrder, getOrders, getOrderDetails } from './routes/orders'
import { sendAuthenticationLink, authenticateFromLink, signOut } from './routes/auth'
import { registerRestaurant, getManagedRestaurant } from './routes/restaurants'
import { createEvaluation, getEvaluations } from './routes/evaluations'
import { registerCustomer, getProfile, updateProfile } from './routes/customers'
import { createPizza, listAllPizzas } from './routes/products/pizzas'

import { updateMenu } from './routes/update-menu'
import { authentication } from './authentication'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type'],
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
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(registerRestaurant)
  .use(registerCustomer)
  .use(sendAuthenticationLink)
  .use(authenticateFromLink)
  .use(createOrder)
  .use(approveOrder)
  .use(cancelOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(getOrders)
  .use(getOrderDetails)
  .use(createEvaluation)
  .use(getEvaluations)
  .use(updateMenu)
  .use(updateProfile)
  .use(getMonthReceipt)
  .use(getMonthOrdersAmount)
  .use(getDayOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getDailyReceiptInPeriod)
  .use(getPopularProducts)
  .use(createPizza)
  .use(listAllPizzas)
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
