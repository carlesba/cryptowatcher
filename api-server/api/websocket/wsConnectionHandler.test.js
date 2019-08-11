const connectionHandler = require('./wsConnectionHandler')
const EventEmitter = require('events')

test(`Client gets a new market quote of the symbol it subscribed to`, () => {
  const bus = new EventEmitter()
  const mockedWebsocket = new EventEmitter()
  const sendSpy = jest.fn()
  mockedWebsocket.send = sendSpy

  connectionHandler(bus, mockedWebsocket)

  // subscribe to ETH
  mockedWebsocket.emit('message', 'ETH')
  // emit new market Quote for ETH
  const marketQuote = {
    symbol: 'ETH',
    price: 193.231,
    currency: 'EUR',
    timestamp: '2019-08-08T07:14:39.090Z'
  }
  bus.emit('NEW_MARKET_QUOTE', marketQuote)
  const { symbol, ...marketQuoteWithoutSymbol } = marketQuote
  const expectedMessage = JSON.stringify(marketQuoteWithoutSymbol)
  expect(sendSpy).toHaveBeenCalledWith(expectedMessage)
})

test(`Invalid client message format will not set subscription`, () => {
  const bus = new EventEmitter()
  const mockedWebsocket = new EventEmitter()
  const sendSpy = jest.fn()
  mockedWebsocket.send = sendSpy

  connectionHandler(bus, mockedWebsocket)

  // invalid message
  const veryBigString = 'this should be a very long string'
  mockedWebsocket.emit('message', veryBigString)
  // emit new market Quote for ETH
  const marketQuote = {
    symbol: veryBigString,
    price: 193.231,
    currency: 'EUR',
    timestamp: '2019-08-08T07:14:39.090Z'
  }
  bus.emit('NEW_MARKET_QUOTE', marketQuote)
  expect(sendSpy).not.toHaveBeenCalled()
})

test(`Client won't get notified with market quotes that is not subscribed to`, () => {
  const bus = new EventEmitter()
  const mockedWebsocket = new EventEmitter()
  const sendSpy = jest.fn()
  mockedWebsocket.send = sendSpy

  connectionHandler(bus, mockedWebsocket)

  // subscribe to ETH
  mockedWebsocket.emit('message', 'ETH')
  // emit new market Quote for ETH
  const marketQuote = {
    symbol: 'BTC',
    price: 10193.219,
    currency: 'EUR',
    timestamp: '2019-08-08T07:14:39.090Z'
  }
  bus.emit('NEW_MARKET_QUOTE', marketQuote)
  expect(sendSpy).not.toHaveBeenCalled()
})

test(`Client usubscribes from bus when the connection is closed`, () => {
  const bus = new EventEmitter()
  const mockedWebsocket = new EventEmitter()
  const sendSpy = jest.fn()
  mockedWebsocket.send = sendSpy

  connectionHandler(bus, mockedWebsocket)

  // subscribe to ETH
  mockedWebsocket.emit('message', 'ETH')

  // disconnect client
  mockedWebsocket.onclose()

  // emit new market Quote for ETH
  const marketQuote = {
    symbol: 'ETH',
    price: 193.231,
    currency: 'EUR',
    timestamp: '2019-08-08T07:14:39.090Z'
  }
  bus.emit('NEW_MARKET_QUOTE', marketQuote)
  expect(sendSpy).not.toHaveBeenCalled()
})
