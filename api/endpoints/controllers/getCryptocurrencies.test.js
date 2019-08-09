const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const Cryptocurrency = require('@models/Cryptocurrency')
const createResponseSpy = require('./utils/createResponseSpy')
const getCryptocurrencies = require('./getCryptocurrencies')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test('Error in database', async done => {
  const mockedFindWithError = (q, opts, fn) => fn(new Error('something bad'))
  const find = Cryptocurrency.find
  Cryptocurrency.find = mockedFindWithError

  const request = {}
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  getCryptocurrencies(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 500 }
  })
  expect(statusSpy).toHaveBeenCalledWith(500)

  Cryptocurrency.find = find
  done()
})

test(`Empty database`, async done => {
  const request = {}
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  getCryptocurrencies(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200, message: 'Subscribe to cryptocurrencies with /POST' },
    data: []
  })
  expect(statusSpy).toHaveBeenCalledWith(200)
  done()
})

test(`Send cryptocurrency's info succesfully`, async done => {
  const request = {}
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  await Cryptocurrency.insertMany([
    { name: 'Bitcoin', coinMarketCapId: 1, symbol: 'BTC', marketQuotes: [] },
    { name: 'Ethereum', coinMarketCapId: 1027, symbol: 'ETH', marketQuotes: [] }
  ])

  getCryptocurrencies(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 },
    data: [
      { name: 'Bitcoin', symbol: 'BTC' },
      { name: 'Ethereum', symbol: 'ETH' }
    ]
  })
  expect(statusSpy).toHaveBeenCalledWith(200)
  done()
})
