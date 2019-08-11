import { h, Component } from 'preact'
import Notifications from './Notifications'
import Selector from './Selector'
import SubscriptionForm, { SUBSCRIPTION_FORM_ERRORS } from './SubscriptionForm'
import MarketQuotes from './MarketQuotes'

const API_URL = process.env.API_URL
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
    const route = `${API_URL}/cryptocurrencies`
    return fetch(route)
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
        const cryptocurrencies = jsonResponse.data
        this.setState({ cryptocurrencies })
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
          <h2>Add a Cryptocurrency</h2>,
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

        {state.selected && [
          <h2>{state.selected}</h2>,
          <MarketQuotes
            key={state.selected}
            forSymbol={state.selected}
            onError={error => {}}
          />
        ]}
      </div>
    )
  }
}

function checkAdminURL() {
  return (
    window &&
    window.location &&
    window.location.href.includes('?admin=handleSubscriptions')
  )
}
