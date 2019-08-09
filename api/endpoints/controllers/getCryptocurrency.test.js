const getCryptocurrency = require('./getCryptocurrency')
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
  const findOneWithError = (q, opts, fn) => {
    fn(new Error('something bad'))
  }
  Cryptocurrency.findOne = findOneWithError

  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrency(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({ status: { code: 500 } })
  expect(statusSpy).toHaveBeenCalledWith(500)
  Cryptocurrency.findOne = findOne
  done()
})

test(`Requested symbol is not in the system`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrency(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({ status: { code: 404 } })
  expect(statusSpy).toHaveBeenCalledWith(404)
  done()
})

test(`Get crypto successfully`, async done => {
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  const crypto = {
    symbol: 'BTC',
    coinMarketCapId: 1,
    name: 'Bitcoin',
    marketQuotes: []
  }
  await Cryptocurrency.create(crypto)

  getCryptocurrency(request, response)
  await tilDone

  const { marketQuotes, coinMarketCapId, ...data } = crypto
  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  done()
})
