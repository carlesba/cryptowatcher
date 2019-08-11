import { h, Component } from 'preact'
import Notifications from './Notifications'
import Selector from './Selector'
import SubscriptionForm, { SUBSCRIPTION_FORM_ERRORS } from './SubscriptionForm'

const API_ROUTE = 'http://localhost:4000/api'
const ROUTE = `${API_ROUTE}/cryptocurrencies`
const GET_CRYPTOCURRENCIES_ERRORS = {
  NETWORK: 'Network Error',
  EMPTY: 'No symbols',
  API: 'API error'
}

export default class Application extends Component {
  constructor() {
    super()
    this.state = {
      cryptocurrencies: [],
      selected: null,
      message: null
    }
  }
  componentDidMount() {
    this.updateCryptocurrencies()
  }
  updateCryptocurrencies() {
    return fetch(ROUTE)
      .then(response => {
        if (response.status >= 400) {
          throw new Error(GET_CRYPTOCURRENCIES_ERRORS.API)
        }
        return response.json()
      })
      .then(jsonResponse => {
        if (!jsonResponse.data.length) {
          throw new Error(GET_CRYPTOCURRENCIES_ERRORS.EMPTY)
        }
        this.setState({ cryptocurrencies: jsonResponse.data })
      })
      .catch(error => {
        let message
        if (error.message === GET_CRYPTOCURRENCIES_ERRORS.EMPTY) {
          message = null
        } else {
          message =
            'There was an error updating this list of available cryptocurrencies'
        }
        this.setState({ message })
      })
  }
  handleSubscriptionFailure(error) {
    let message
    switch (error.message) {
      case SUBSCRIPTION_FORM_ERRORS.BAD_SYMBOL:
        message =
          'The requested symbol is invalid. Remember that symbols are case sensitive.'
        break
      case SUBSCRIPTION_FORM_ERRORS.REDUNDANT:
        message = `The requested symbols was already in the subscription list. If you can't see it try to reload the page.`
        break
      case SUBSCRIPTION_FORM_ERRORS.UNEXPECTED:
      default:
        message = 'The application failed when requesting that symbols.'
    }
    this.setState({ message })
  }
  render(props, state) {
    const isAdmin = checkAdminURL()
    return (
      <div>
        <Notifications
          message={state.message}
          onClose={() => this.setState({ message: null })}
        />
        <h1>Cryptowatch</h1>
        {isAdmin && [
          <h2>Subscribe to a Cryptocurrencies</h2>,
          <SubscriptionForm
            onSubscriptionSucceed={() => {
              this.updateCryptocurrencies()
            }}
            onFailure={error => {
              this.handleSubscriptionFailure(error)
            }}
          />
        ]}
        <h2>Cryptocurrencies</h2>
        <Selector
          indexedKey="symbol"
          labelFromChoice={choice => `${choice.symbol} | ${choice.name}`}
          choices={state.cryptocurrencies}
          selected={state.selected}
          onSelect={crypto => {
            this.setState({ selected: crypto.symbol })
          }}
        />
      </div>
    )
  }
}

function checkAdminURL() {
  return (
    window &&
    window.location &&
    window.location.href.includes('?admin=showForm')
  )
}
