const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const Cryptocurrency = require('@models/Cryptocurrency')

jest.mock('@services/coinMarketCap/MarketQuotesProvider')
const MarketQuotesProvider = require('@services/coinMarketCap/MarketQuotesProvider')
const MarketQuotesUpdater = require('./MarketQuotesUpdater')

const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test(`Avoid external service when there're no cryptocurrencies to update`, done => {
  const spy = jest.fn()
  MarketQuotesProvider.fetch.mockImplementation((ids, cb) => {
    spy()
  })

  MarketQuotesUpdater.update(function(error) {
    expect(error).toBe(null)
    expect(spy).not.toHaveBeenCalled()
    done()
  })
})
test('Database has wrong coinMarketCapId', async done => {
  await Cryptocurrency.insertMany([
    { name: 'Bitcoin', coinMarketCapId: 1, symbol: 'BTC', marketQuotes: [] },
    { name: 'Ethereum', coinMarketCapId: 1027, symbol: 'ETH', marketQuotes: [] }
  ])

  MarketQuotesProvider.fetch.mockImplementation((ids, cb) => {
    cb(new Error(MarketQuotesProvider.ERRORS.INVALID_ID))
  })

  MarketQuotesUpdater.update(function(error) {
    expect(error.message).toBe(MarketQuotesUpdater.ERRORS.DATABASE_CORRUPTED)
    done()
  })
})
test('CoinMarketCap has issues', done => {
  MarketQuotesProvider.fetch.mockImplementation((ids, cb) => {
    cb(new Error(MarketQuotesProvider.ERRORS.COINMARKETCAP_ERROR))
  })

  MarketQuotesUpdater.update(function(error) {
    expect(error.message).toBe(MarketQuotesUpdater.ERRORS.EXTERNAL_SERVICE)
    done()
  })
})
test('MarketQuotes are stored succesfully', async done => {
  const spy = jest.fn()
  const marketQuotes = {
    '1': {
      price: 10230,
      currency: 'EUR',
      timestamp: '2019-08-09T06:58:26.000Z'
    },
    '1027': {
      price: 202,
      currency: 'EUR',
      timestamp: '2019-08-09T06:58:26.000Z'
    }
  }
  MarketQuotesProvider.fetch.mockImplementation((ids, cb) => {
    spy(ids)
    cb(null, marketQuotes)
  })

  MarketQuotesUpdater.update(async function(error) {
    expect(error).toBe(null)
    expect(spy).toHaveBeenCalledWith([1, 1027])
    const crypto = await Cryptocurrency.findOne({ symbol: 'BTC' })
    expect(crypto.marketQuotes.length).toBe(1)
    done()
  })
})
