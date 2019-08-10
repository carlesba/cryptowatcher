const Cryptocurrency = require('@models/Cryptocurrency')
const MarketQuote = require('@models/MarketQuote')

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
  const marketQuotes = [
    {
      symbol: 'BTC',
      price: 10230,
      currency: 'EUR',
      timestamp: '2019-08-09T06:58:26.000Z'
    },
    {
      symbol: 'ETH',
      price: 202,
      currency: 'EUR',
      timestamp: '2019-08-09T06:58:26.000Z'
    }
  ]
  MarketQuotesProvider.fetch.mockImplementation((ids, cb) => {
    spy(ids)
    cb(null, marketQuotes)
  })

  MarketQuotesUpdater.update(async function(error) {
    expect(error).toBe(null)
    expect(spy).toHaveBeenCalledWith([1, 1027])

    const quotes = await MarketQuote.find({})
    expect(quotes.length).toBe(2)
    done()
  })
})
