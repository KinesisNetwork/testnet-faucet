import React from 'react'
import { Connection, fetchConnections } from '../shared/connections'
import icon from './images/icon.png'

interface State {
  address: string
  connections: Connection[]
  error: string
  funded: number
  pending: boolean
  selectedConnection: Connection
}

class App extends React.Component<{}, State> {
  state: State = {
    address: '',
    connections: [],
    error: '',
    funded: 0,
    pending: false,
    selectedConnection: {} as Connection,
  }

  async componentDidMount() {
    const connections = await fetchConnections()

    this.setState({ connections, selectedConnection: connections[0] })
  }

  render() {
    const { address, connections, error, funded, pending, selectedConnection } = this.state
    
    return (
      <article className="hero is-fullheight">
        <div className="hero-head">
          <nav className="navbar ">
            <div className="container">
              <div className="navbar-brand">
                <a className="navbar-item">
                  <img src={icon} alt="Logo" style={{ filter: 'invert(100%)' }} />
                </a>
                <a className="navbar-item">
                  Kinesis Testnet Faucet
                </a>
              </div>
            </div>
          </nav>
        </div>

        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title">Fund Testnet Account</h1>
            <form onSubmit={this.handleSubmit}>
              <div className="field has-addons has-addons-centered">
                <div className="control">
                  <span className="select">
                    <select className="input is-medium" name="currency" onChange={this.handleSelect}>
                      {connections.map(({ currency }) =>
                        <option key={currency} value={currency}>{currency}</option>
                      )}
                    </select>
                  </span>
                </div>
                <div className="control is-expanded">
                  <input
                    className={`input is-medium ${ error ? 'is-danger' : '' }`}
                    type="text"
                    name="address"
                    placeholder="Public Key e.g. GBXY..."
                    value={address}
                    disabled={pending || !!funded}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="control">
                  <button
                    className={`button is-success is-medium ${ pending ? 'is-loading' : '' }`}
                    type="submit"
                    disabled={!!funded || !address }
                  >
                    Fund Account
                  </button>
                </div>
              </div>
              {!!error && <div className="subtitle has-text-danger">{error}</div> }
              {!!funded && (
                <div className="subtitle">
                  You received {funded} {selectedConnection.currency}
                </div>
              )}
            </form>
          </div>
        </div>
 
        <div className="hero-footer" />
      </article>
    )
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = ev => {
    this.setState({ address: ev.currentTarget.value })
  }

  private handleSelect: React.ChangeEventHandler<HTMLSelectElement> = ev => {
    const { value: currency } = ev.currentTarget
    this.setState(({ connections }) => ({
      selectedConnection: connections.find(conn => conn.currency === currency)
    }))
  }

  private handleSubmit: React.FormEventHandler = async ev => {
    ev.preventDefault()

    this.setState({ pending: true, error: '' })

    const { address, selectedConnection } = this.state

    const response = await fetch(`/fund/${address}`, {
      body: JSON.stringify(selectedConnection),
      credentials: 'include',
      headers: {
        'csrf-token': (window as any).csrf,
      },
      method: 'POST',
    })
    if (response.status === 429) {
      const errors = await response.json()
      this.setState({
        error: `Request limit reached. Please wait until ${new Date(errors.limitEnd).toTimeString()}`
      })
    } else if (response.status === 400) {
      this.setState({ error: 'Invalid address' })
    } else {
      const { fundedAmount } = await response.json()
      this.setState({ funded: fundedAmount, error: '' })
      setTimeout(() => this.setState({ funded: 0 }), 2000)
    }

    this.setState({ pending: false })
  }
}

export default App
