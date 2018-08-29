import server from 'server'
import { status, render, redirect, Reply } from 'server/reply'
import { get, post } from 'server/router'

import { Connection } from './shared/connections'
import fundAccount from './fundAccount'

const rateLimiter: {
  [currency: string]: {
    [key: string]: Date
  }
} = {}
const limit = 1000 * 60 * 60 // 1 hour

server({ port: 3000, public: 'dist', views: 'dist', security: false }, [
  get('/', _ => render('index.html')),
  get('/*', _ => redirect('/')),
  post('/fund/:address', ctx => {
    const connection: Connection = JSON.parse(ctx.data)
    return handleFundRequest(ctx.params.address, connection)
  }),
])

async function handleFundRequest(address: string, connection: Connection): Promise<Reply> {
  const requestTime = new Date()
  const { currency } = connection

  if (isOverRateLimit(address, currency, requestTime)) {
    return status(429).json({ limitEnd: rateLimiter[currency][address] })
  }

  try {
    const fundedAmount = await fundAccount(address, connection)
    const newLimit = new Date(requestTime.valueOf() + limit)
    
    if (rateLimiter[currency]) {
      rateLimiter[currency][address] = newLimit
    } else {
      rateLimiter[currency] = {
        [address]: newLimit
      }
    }
    
    return status(200).send({ fundedAmount })

  } catch (e) {
    return status(400).send({ e })
  }

}

function isOverRateLimit(address: string, currency: string, currentTime: Date): boolean {
  return (
    rateLimiter[currency] &&
    rateLimiter[currency][address] &&
    currentTime.valueOf() - rateLimiter[currency][address].valueOf() < 0
  )
}
