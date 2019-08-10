const moment = require('moment')
const _ = require('lodash')
const getCryptocurrencyHistory = require('./getCryptocurrencyHistory')
const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const createResponseSpy = require('./utils/createResponseSpy')
const Cryptocurrency = require('@models/Cryptocurrency')
const MarketQuote = require('@models/MarketQuote')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test(`Requested symbol is not in the system`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrencyHistory(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 404, message: 'Cannot find BTC. May need subscription.' }
  })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})
test('Symbol is in the system without market quotes', async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const crypto = {
    symbol: 'BTC',
    name: 'Bitcoin',
    coinMarketCapId: 1
  }
  await Cryptocurrency.create(crypto)

  getCryptocurrencyHistory(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: []
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})

test(`Get history for last 100 minutes successfully`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  let marketQuotes = [
    {
      symbol: 'BTC',
      price: 10100,
      currency: 'EUR'
    },
    {
      symbol: 'BTC',
      price: 10200,
      currency: 'EUR'
    },
    {
      symbol: 'BTC',
      price: 10300,
      currency: 'EUR'
    }
  ]
  // set marketQuotes timestamp to a 75' period until now
  // 75' is picked so 2 elements will be in the range of 100'
  // so newest element will be the last one
  marketQuotes = marketQuotes.map((mq, i) => {
    const minutesAgo = (marketQuotes.length - 1 - i) * 75
    const timestamp = moment()
      .subtract(minutesAgo, 'minute')
      .toISOString()
    return { ...mq, timestamp }
  })
  await MarketQuote.insertMany(marketQuotes)

  getCryptocurrencyHistory(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: marketQuotes.map(m => _.omit(m, ['symbol'])).slice(1, 3)
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})
