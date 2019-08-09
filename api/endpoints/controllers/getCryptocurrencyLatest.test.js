const getCryptocurrencyLatest = require('./getCryptocurrencyLatest')
const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const createResponseSpy = require('./utils/createResponseSpy')
const Cryptocurrency = require('@models/Cryptocurrency')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test('Error when querying database', async done => {
  const findOne = Cryptocurrency.findOne
  const findOneWithError = (q, fn) => {
    fn(new Error('something bad'))
  }
  Cryptocurrency.findOne = findOneWithError

  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({ status: { code: 500 } })
  expect(statusSpy).toHaveBeenCalledWith(500)
  Cryptocurrency.findOne = findOne
  done()
})

test(`Requested symbol is not in the system`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 404, message: 'Cannot find BTC. May need subscription.' }
  })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})

test(`Requested symbol is in the system without quotes`, async done => {
  const request = { params: { symbol: 'ETH' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const crypto = {
    symbol: 'ETH',
    coinMarketCapId: 1027,
    name: 'Ethereum',
    marketQuotes: []
  }
  await Cryptocurrency.create(crypto)
  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 404, message: 'No market quotes yet for ETH' }
  })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})

test(`Get latest successfully`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const crypto = {
    symbol: 'BTC',
    coinMarketCapId: 1,
    name: 'Bitcoin',
    marketQuotes: [
      { price: 10300, currency: 'EUR', timestamp: '2019-08-08T07:54:39.090Z' },
      { price: 10100, currency: 'EUR', timestamp: '2019-08-08T07:34:39.090Z' },
      { price: 10200, currency: 'EUR', timestamp: '2019-08-08T07:14:39.090Z' }
    ]
  }
  await Cryptocurrency.create(crypto)

  getCryptocurrencyLatest(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: crypto.marketQuotes[0]
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})
