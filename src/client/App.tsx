import React from 'react'
import 'babel-polyfill'

class App extends React.Component {
  state = {
    pending: false,
    funded: false,
    address: '',
    error: ''
  }

  render() {
    return (
      <article className="hero is-fullheight is-primary is-bold">
        <div className="hero-head" />
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title">Fund Account</h1>
            <form onSubmit={this.handleSubmit}>
              <div className="field has-addons has-addons-centered">
                <div className="control">
                  <input
                    className={`input is-medium ${
                      this.state.error ? ' is-danger' : ''
                    }`}
                    type="text"
                    placeholder="e.g. GBXY..."
                    value={this.state.address}
                    disabled={this.state.pending || this.state.funded}
                    onChange={this.handleChange}
                  />
                  <p className="help is-danger">{this.state.error}</p>
                </div>
                <div className="control">
                  <button
                    className={`button is-success is-medium ${
                      this.state.pending ? 'is-loading' : ''
                    }`}
                    type="submit"
                    disabled={this.state.funded}
                  >
                    Fund Account
                  </button>
                </div>
              </div>
            </form>
            {this.state.funded && (
              <div className="subtitle">You received 30 KAU</div>
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

  private handleSubmit: React.FormEventHandler = async ev => {
    ev.preventDefault()
    this.setState({ pending: true })
    const response = await fetch(`/fund/${this.state.address}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'csrf-token': (window as any).csrf }
    })
    if (response.status === 429) {
      const errors = await response.json()
      this.setState({
        error: `Requesting too much. Need to wait till ${errors.limitEnd}`
      })
    } else if (response.status === 400) {
      this.setState({ error: 'Invalid address' })
    } else {
      this.setState({ funded: response.ok })
    }

    this.setState({ pending: false })
  }
}

export default App
