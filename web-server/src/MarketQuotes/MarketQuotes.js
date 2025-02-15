import { h, Component } from 'preact'
import './styles.css'

const API_URL = process.env.API_URL
const WEBSOCKET_URL = process.env.WEBSOCKET_URL

export const ERRORS = {
  NOT_FOUND: 'Symbols was not found',
  SERVER: 'There was an error in the server',
  UNEXPECTED: 'Something went wrong'
}
/**
 * Fetch the MarketQuotes for a given symbol
 * @prop {string} forSymbol Symbol which market quotes will be fetched for
 * @prop {function} onError Called when something goes wrongly while
 *                          updating the market quotes. An error from
 *                          Errors will be passed.
 *                          (Error) => Void
 */
export default class MarketQuotes extends Component {
  constructor() {
    super()
    this.state = {
      marketQuotes: []
    }
    this.ws = {}
    this.fetchHistory = this.fetchHistory.bind(this)
    this.handleWsMessage = this.handleWsMessage.bind(this)
    this.startWebsocket = this.startWebsocket.bind(this)
  }
  componentDidMount() {
    this.fetchHistory()
    this.startWebsocket()
  }
  componentWillUnmount() {
    this.closeWebsocket()
  }
  startWebsocket() {
    this.ws = new WebSocket(WEBSOCKET_URL)
    this.ws.onopen = () => {
      console.log('connected to ws')
      this.ws.send(this.props.forSymbol)
    }
    this.ws.onmessage = this.handleWsMessage
  }
  closeWebsocket() {
    this.ws.close()
  }
  handleWsMessage(message) {
    try {
      const marketQuote = JSON.parse(message.data)
      const marketQuotes = [marketQuote].concat(this.state.marketQuotes)
      this.setState({ marketQuotes })
    } catch (error) {
      console.log('could not read websocket message')
    }
  }
  fetchHistory() {
    const route =
      API_URL + '/cryptocurrencies/' + this.props.forSymbol + '/history'
    fetch(route, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    })
      .then(response => {
        if (response.status === 404) {
          throw new Error(ERRORS.NOT_FOUND)
        }
        if (response.status === 500) {
          throw new Error(ERRORS.SERVER)
        }
        if (response.status >= 400) {
          throw new Error(ERRORS.UNEXPECTED)
        }
        return response.json()
      })
      .then(json => {
        const marketQuotes = []
          .concat(json.data)
          .concat(this.state.marketQuotes)
        this.setState({ marketQuotes })
      })
      .catch(reason => {
        const error = this.readError(reason)
        this.props.onError(error)
      })
  }
  readError(error) {
    let failureKey = Object.keys(ERRORS).find(
      errorkey => ERRORS[errorkey] === error.message
    )
    if (!failureKey) {
      failureKey = ERRORS.UNEXPECTED
    }
    return new Error(ERRORS[failureKey])
  }
  formatDate(timestamp) {
    const date = new Date(timestamp)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  formatTime(timestamp) {
    const date = new Date(timestamp)
    const hour = date.getHours()
    const minutes = date.getMinutes()
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString()
    return `${hour}:${paddedMinutes}`
  }
  formatPrice(price) {
    const roundedPrice = `${Math.round(price * 100) / 100}`
    const [priceInteger, priceDecimal] = roundedPrice.split('.')
    let decimal = priceDecimal
    if (!decimal) {
      decimal = '00'
    } else if (decimal.length === 1) {
      decimal = `0${decimal}`
    }
    return `${priceInteger}.${decimal}`
  }
  render(props, state) {
    return (
      <table className="MarketQuotes">
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Price</th>
        </tr>
        {state.marketQuotes.map(marketQuote => (
          <tr key={marketQuote.timestamp}>
            <td>{this.formatDate(marketQuote.timestamp)}</td>
            <td>{this.formatTime(marketQuote.timestamp)}</td>
            <td>{this.formatPrice(marketQuote.price)}</td>
          </tr>
        ))}
      </table>
    )
  }
}
