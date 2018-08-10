import {
  Server,
  Operation,
  Asset,
  TransactionBuilder,
  Keypair,
  Network
} from 'js-kinesis-sdk'

const FUNDING_ACCOUNT_KEYPAIR = Keypair.fromSecret(
  process.env.FUNDING_ACCOUNT_SECRET ||
    'SAR4YMRBHLU7P7UNPEAOQGSS5P3G4PNALDE3CNOCFNLJC2PA6TS3K44H'
)
const FUNDABLE_AMOUNT = Number(process.env.FUNDABLE_AMOUNT) || 30 // lumens
const AMOUNT_TO_STROOPS_FEE = 10e5 * 45

Network.use(new Network('Kinesis UAT'))

export default async function fundAccount(destination: string) {
  const server = new Server('https://kau-testnet.kinesisgroup.io')
  const accountExists = await server
    .loadAccount(destination)
    .then(_exists => true, _error => false)
  const operation = accountExists
    ? Operation.payment({
        destination,
        asset: Asset.native(),
        amount: String(FUNDABLE_AMOUNT)
      })
    : Operation.createAccount({
        destination: destination,
        startingBalance: String(FUNDABLE_AMOUNT)
      })
  const fundingAccount = await server.loadAccount(
    FUNDING_ACCOUNT_KEYPAIR.publicKey()
  )
  const transaction = new TransactionBuilder(fundingAccount, {
    fee: String(FUNDABLE_AMOUNT * AMOUNT_TO_STROOPS_FEE)
  })
    .addOperation(operation)
    .build()
  transaction.sign(FUNDING_ACCOUNT_KEYPAIR)
  await server.submitTransaction(transaction)
}
