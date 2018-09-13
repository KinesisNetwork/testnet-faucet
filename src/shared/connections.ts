
const CONNECTIONS_URL = 'https://s3-ap-southeast-2.amazonaws.com/kinesis-config/kinesis-server-details.json'

export interface Connection {
  name: string
  horizonURL: string
  networkPassphrase: string
  stage: string
  currency: string
}

export async function fetchConnections(): Promise<Connection[]> {
  const response = await fetch(CONNECTIONS_URL, { credentials: 'omit' })
  const connections: Connection[] = await response.json()

  return connections.filter(({ stage }) => stage === 'testnet')
}
