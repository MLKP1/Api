import Elysia from 'elysia'

export const getHealthy = new Elysia()
  .get('/ping', async () => {
    const message = 'pong'

    return message
  })
