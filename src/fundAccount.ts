import {
  Server,
  Operation,
  Asset,
  TransactionBuilder,
  Keypair,
  Network
} from 'js-kinesis-sdk'

import { Connection } from './shared/connections'

const fundingKeypair = Keypair.fromSecret(
  process.env.FUNDING_ACCOUNT_SECRET ||
    'SDWJ4EDVBAKKLP5NADFEQLPSSXRQ4PZPTIPBS4FNCIAPP4AOO4S4OPWN'
)
const STROOPS_IN_ONE_KINESIS = 1e7
const amountToFund = Number(process.env.FUNDABLE_AMOUNT) || 5 // lumens

export default async function fundAccount(destination: string, connection: Connection) {
  await Network.use(new Network(connection.networkPassphrase))
  
  const server = new Server(connection.horizonURL)
  
  const accountExists = await server
    .loadAccount(destination)
    .then(_exists => true, _error => false)
  
  const operation = accountExists
  ? Operation.payment({
    destination,
    asset: Asset.native(),
    amount: String(amountToFund)
  })
  : Operation.createAccount({
    destination,
    startingBalance: String(amountToFund)
  })
  
  const fee = await getFeeInStroops(server, amountToFund)
  
  const fundingAccount = await server.loadAccount(fundingKeypair.publicKey())
  const transaction = new TransactionBuilder(fundingAccount, { fee: String(fee) })
    .addOperation(operation)
    .build()
    
  transaction.sign(fundingKeypair)

  await server.submitTransaction(transaction)

  return amountToFund
}

async function getFeeInStroops(server: Server, amountInKinesis: number) {
  const { records: [ mostRecentLedger ] } = await server.ledgers().order('desc').limit(1).call()
  const {
    base_percentage_fee: basePercentageFee,
    base_fee_in_stroops: baseFeeInStroops,
  } = mostRecentLedger

  const basisPointsToPercent = 10000

  const percentageFee =
    ((Number(amountInKinesis) * basePercentageFee) / basisPointsToPercent) * STROOPS_IN_ONE_KINESIS

  return String(Math.ceil(percentageFee + baseFeeInStroops))
}
