import server from 'server'
import { status, render, redirect, Reply } from 'server/reply'
import { get, post } from 'server/router'
import fundAccount from './fundAccount'

const rateLimiter: { [key: string]: Date } = {}
const limit = 1000 * 60 * 60 // 1 hour

server({ port: 3000, public: 'dist', views: 'dist', security: false }, [
  get('/', _ctx => render('index.html')),
  get('/*', _ => redirect('/')),
  post('/fund/:address', ctx => handleFundRequest(ctx.params.address))
])

async function handleFundRequest(address: string): Promise<Reply> {
  const requestTime = new Date()
  if (isOverRateLimit(address, requestTime)) {
    return status(429).json({ limitEnd: rateLimiter[address] })
  }

  try {
    await fundAccount(address)
  } catch (e) {
    return status(400).send({ e })
  }

  rateLimiter[address] = requestTime
  return status(200)
}

function isOverRateLimit(address: string, currentTime: Date): boolean {
  return (
    rateLimiter[address] &&
    currentTime.valueOf() - rateLimiter[address].valueOf() < limit
  )
}
