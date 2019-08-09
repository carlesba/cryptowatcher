const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const MarketQuotesProvider = require('./MarketQuotesProvider')

test(`Request bad ids`, done => {
  const ids = [1, 10223]

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest')
    .reply(400, {
      status: {
        timestamp: '2019-08-09T06:59:45.159Z',
        error_code: 400,
        error_message: 'Invalid value for "id": "10223"',
        elapsed: 0,
        credit_count: 0
      }
    })
  MarketQuotesProvider.fetch(ids, error => {
    expect(error).toEqual(new Error(MarketQuotesProvider.ERRORS.INVALID_ID))
    done()
  })
})
test('CoinMarketCap errors', done => {
  const ids = [1, 10223]

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest')
    .reply(500, {
      status: {
        timestamp: '2019-08-09T06:59:45.159Z',
        error_code: 500,
        error_message: 'Invalid value for "id": "10223"',
        elapsed: 0,
        credit_count: 0
      }
    })
  MarketQuotesProvider.fetch(ids, error => {
    expect(error).toEqual(
      new Error(MarketQuotesProvider.ERRORS.COINMARKETCAP_ERROR)
    )
    done()
  })
})
test('Something fails in the program', done => {
  const ids = [1]

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest')
    .reply(500)
  MarketQuotesProvider.fetch(ids, error => {
    expect(error).toEqual(new Error(MarketQuotesProvider.ERRORS.UNEXPECTED))
    done()
  })
})
test('Get market quotes successfully', done => {
  const ids = [1, 1027]

  const mock = new MockAdapter(axios)
  mock
    .onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest')
    .reply(200, QUOTES_RESPONSE)
  const expectedMarketQuotes = {
    '1': {
      price: QUOTES_RESPONSE.data['1'].quote.EUR.price,
      currency: 'EUR',
      timestamp: QUOTES_RESPONSE.data['1'].quote.EUR.last_updated
    },
    '1027': {
      price: QUOTES_RESPONSE.data['1027'].quote.EUR.price,
      currency: 'EUR',
      timestamp: QUOTES_RESPONSE.data['1027'].quote.EUR.last_updated
    }
  }

  MarketQuotesProvider.fetch(ids, (error, data) => {
    expect(data).toEqual(expectedMarketQuotes)
    expect(error).toBe(null)
    done()
  })
})

const QUOTES_RESPONSE = {
  status: {
    timestamp: '2019-08-09T06:59:15.255Z',
    error_code: 0,
    error_message: null,
    elapsed: 8,
    credit_count: 1
  },
  data: {
    '1': {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      slug: 'bitcoin',
      num_market_pairs: 7810,
      date_added: '2013-04-28T00:00:00.000Z',
      tags: ['mineable'],
      max_supply: 21000000,
      circulating_supply: 17866187,
      total_supply: 17866187,
      platform: null,
      cmc_rank: 1,
      last_updated: '2019-08-09T06:58:26.000Z',
      quote: {
        EUR: {
          price: 10579.570658804241,
          volume_24h: 17052900471.116955,
          percent_change_1h: -0.1569,
          percent_change_24h: -0.2583,
          percent_change_7d: 13.0559,
          market_cap: 189016587769.9098,
          last_updated: '2019-08-09T06:59:00.000Z'
        }
      }
    },
    '1027': {
      id: 1027,
      name: 'Ethereum',
      symbol: 'ETH',
      slug: 'ethereum',
      num_market_pairs: 5534,
      date_added: '2015-08-07T00:00:00.000Z',
      tags: ['mineable'],
      max_supply: null,
      circulating_supply: 107245820.874,
      total_supply: 107245820.874,
      platform: null,
      cmc_rank: 2,
      last_updated: '2019-08-09T06:58:22.000Z',
      quote: {
        EUR: {
          price: 194.19397152115997,
          volume_24h: 6082113132.574833,
          percent_change_1h: 0.337,
          percent_change_24h: -3.639,
          percent_change_7d: -0.849,
          market_cap: 20826491884.568977,
          last_updated: '2019-08-09T06:59:00.000Z'
        }
      }
    }
  }
}
