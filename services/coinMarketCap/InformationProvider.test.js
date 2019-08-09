const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const InformationProvider = require('./InformationProvider')

test(`Request bad symbol`, async done => {
  const symbols = 'BT'

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map')
    .reply(400, {
      status: {
        timestamp: '2019-08-07T09:20:11.392Z',
        error_code: 400,
        error_message: 'Invalid value for "symbol": "BT"',
        elapsed: 0,
        credit_count: 0
      }
    })

  InformationProvider.fetch(symbols, error => {
    expect(error).toEqual(new Error(InformationProvider.ERRORS.INVALID_SYMBOL))
    done()
  })
})

test('CoinMarketCap issues', async done => {
  const symbols = 'BTC'

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map')
    .reply(429, {
      status: {
        timestamp: '2019-08-07T09:20:11.392Z',
        error_code: 429,
        error_message: 'Too many requests',
        elapsed: 0,
        credit_count: 0
      }
    })

  InformationProvider.fetch(symbols, error => {
    expect(error).toEqual(
      new Error(InformationProvider.ERRORS.COINMARKETCAP_ERROR)
    )
    done()
  })
})

test(`Fetch ids successfully`, async done => {
  const symbols = 'BTC'

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map')
    .reply(200, SYMBOLS_RESPONSE)

  InformationProvider.fetch(symbols, (error, information) => {
    expect(error).toBe(null)
    expect(information).toEqual({
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC'
    })
    done()
  })
})

const SYMBOLS_RESPONSE = {
  status: {
    timestamp: '2019-08-07T09:04:05.831Z',
    error_code: 0,
    error_message: null,
    elapsed: 5,
    credit_count: 1
  },
  data: [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      slug: 'bitcoin',
      is_active: 1,
      is_listed: 0,
      first_historical_data: '2013-04-28T18:47:21.000Z',
      last_historical_data: '2019-08-07T08:59:00.000Z',
      platform: null
    }
  ]
}
