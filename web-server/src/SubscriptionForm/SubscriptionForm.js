import { h, Component } from 'preact'

const API_ROUTE = 'http://localhost:4000/api'
const ROUTE = `${API_ROUTE}/cryptocurrencies`

export const API_ERRORS = {
  BAD_SYMBOL: 'Symbol is not valid',
  REDUNDANT: 'Already subscribed',
  UNEXPECTED: 'Something went wrong'
}

/**
 * Handle subscriptions to cryptocurrencies
 *
 * @prop {function} onSubscriptionSucceed Called when a subscription has been
 *                                        completed successfully
 * @prop {function} onFailure Called when a subscription failed. Will be called
 *                            with an error from API_ERRORS
 */
export default class SubscriptionForm extends Component {
  constructor() {
    super()
    this.state = { value: '', disabled: false }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange(event) {
    this.setState({ value: event.target.value })
  }
  handleSubmit(event) {
    event.preventDefault()
    const { disabled, value } = this.state
    if (disabled || value === '') return
    this.setState({ disabled: true }, () => this.subscribeSymbol(value))
  }
  subscribeSymbol(symbol) {
    return fetch(ROUTE, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify({ symbol: symbol.trim() })
    })
      .then(response => {
        if (response.status === 400) {
          throw new Error(API_ERRORS.BAD_SYMBOL)
        }
        if (response.status === 304) {
          throw new Error(API_ERRORS.REDUNDANT)
        }
        if (response.status > 400) {
          throw new Error(API_ERRORS.UNEXPECTED)
        }
        return response.json()
      })
      .then(json => {
        this.setState({ disabled: false, value: '' }, () => {
          this.props.onSubscriptionSucceed(json.data)
        })
      })
      .catch(error => {
        this.setState({ disabled: false }, () => {
          const failure = this.readError(error)
          this.props.onFailure(failure)
        })
      })
  }
  readError(error) {
    let failureKey = Object.keys(API_ERRORS).find(
      errorkey => API_ERRORS[errorkey] === error.message
    )
    if (!failureKey) {
      failureKey = API_ERRORS.UNEXPECTED
    }
    return new Error(API_ERRORS[failureKey])
  }
  render(props, state) {
    const disabledButton = state.disabled || state.value === ''
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          disabled={state.disabled}
          type="text"
          value={state.value}
          onInput={this.handleChange}
        />
        <button disabled={disabledButton}>Add</button>
      </form>
    )
  }
}
