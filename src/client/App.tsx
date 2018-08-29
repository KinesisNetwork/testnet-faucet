import React from 'react'

import { Connection, fetchConnections } from '../shared/connections'

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
      <article className="hero is-fullheight is-dark is-bold">
        <div className="hero-head" />
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title">Fund {selectedConnection.currency} Testnet Account</h1>
            <form onSubmit={this.handleSubmit}>
              <div className="field">
                <div className="control select has-icons-left is-info">
                  <select
                    className="input is-medium"
                    name="currency"
                    onChange={this.handleSelect}
                  >
                    <option disabled value=''>Select Currency</option>
                    { connections.map(({ currency }) =>
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    )}
                  </select>
                </div>
              </div>
              <div className="field has-addons has-addons-centered">
                <div className="control is-expanded">
                  <input
                    className={`input is-medium ${ error ? 'is-danger' : '' }`}
                    type="text"
                    name="address"
                    placeholder="e.g. GBXY..."
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
            </form>
            {!!error && <p className="subtitle has-text-danger">{error}</p> }
            {!!funded && (
              <div className="subtitle">
                You received {funded} {selectedConnection.currency}
              </div>
            )}
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
        error: `Requesting too much. Need to wait till ${new Date(errors.limitEnd).toTimeString()}`
      })
    } else if (response.status === 400) {
      this.setState({ error: 'Invalid address' })
    } else {
      const res = await response.json()
      this.setState({ funded: res.fundedAmount, error: '' })
      setTimeout(() => this.setState({ funded: 0 }), 2000)
    }

    this.setState({ pending: false })
  }
}

export default App
