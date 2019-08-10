const postCryptocurrency = require('./postCryptocurrency')
const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const Cryptocurrency = require('@models/Cryptocurrency')
const createResponseSpy = require('./utils/createResponseSpy')

jest.mock('@services/coinMarketCap/InformationProvider')
const InformationProvider = require('@services/coinMarketCap/InformationProvider')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test('Bad symbol', async done => {
  InformationProvider.fetch.mockImplementation((q, fn) =>
    fn(new Error(InformationProvider.ERRORS.INVALID_SYMBOL))
  )
  const request = { body: { symbol: 'BT' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  postCryptocurrency(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: {
      code: 400,
      message: 'Invalid symbol'
    }
  })
  expect(statusSpy).toHaveBeenCalledWith(400)
  done()
})
test('InformationProvider fails', async done => {
  InformationProvider.fetch.mockImplementation((q, fn) =>
    fn(new Error(InformationProvider.ERRORS.FETCHID_ERROR))
  )
  const request = { body: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  postCryptocurrency(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: {
      code: 500,
      message: 'Internal error'
    }
  })
  expect(statusSpy).toHaveBeenCalledWith(500)
  done()
})

test('Avoid subscribing to existing cryptocurrencies', async done => {
  const symbol = 'BTC'
  const crypto = {
    symbol,
    coinMarketCapId: 1,
    name: 'Bitcoin',
    marketQuotes: []
  }
  await Cryptocurrency.create(crypto)
  const request = { body: { symbol } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()
  postCryptocurrency(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 304 }
  })
  expect(statusSpy).toHaveBeenCalledWith(304)
  const cryptos = await Cryptocurrency.find({ symbol })
  expect(cryptos.length).toBe(1)
  done()
})

test('Add subscription succesfully', async done => {
  const ETH_INFO = {
    id: 1027,
    name: 'Ethereum',
    symbol: 'ETH'
  }
  InformationProvider.fetch.mockImplementation((q, fn) => fn(null, ETH_INFO))
  const request = { body: { symbol: 'ETH' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  postCryptocurrency(request, response)
  await tilDone

  expect(sendSpy).toHaveBeenCalledWith({
    status: { code: 200 }
  })
  expect(statusSpy).toHaveBeenCalledWith(200)

  const exists = await Cryptocurrency.exists({ symbol: 'ETH' })
  expect(exists).toBe(true)

  done()
})
