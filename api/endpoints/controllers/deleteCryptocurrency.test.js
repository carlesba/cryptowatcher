const deleteCryptocurrency = require('./deleteCryptocurrency')
const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const createResponseSpy = require('./utils/createResponseSpy')
const Cryptocurrency = require('@models/Cryptocurrency')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test(`Cannot delete from database`, async done => {
  const findOneAndDelete = Cryptocurrency.findOneAndDelete
  const mockedFindOneAndDelete = (q, fn) => {
    fn(new Error('something bad'))
  }
  Cryptocurrency.findOneAndDelete = mockedFindOneAndDelete
  const request = { params: { symbol: 'BTC' } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  deleteCryptocurrency(request, response)
  await tilDone
  expect(sendSpy).toHaveBeenCalledWith({
    status: {
      code: 500,
      message: `Couldn't unsubscribe from BTC`
    }
  })
  expect(statusSpy).toHaveBeenCalledWith(500)

  Cryptocurrency.findOneAndDelete = findOneAndDelete
  done()
})

test(`Delete successfully`, async done => {
  const symbol = 'BTC'
  const crypto = {
    symbol,
    name: 'Bitcoin',
    coinMarketCapId: 1,
    marketQuotes: []
  }
  await Cryptocurrency.create(crypto)
  const request = { params: { symbol } }
  const { response, tilDone, statusSpy, sendSpy } = createResponseSpy()

  deleteCryptocurrency(request, response)
  await tilDone
  expect(sendSpy).toHaveBeenCalledWith({
    status: {
      code: 200
    }
  })
  expect(statusSpy).toHaveBeenCalledWith(200)
  const exists = await Cryptocurrency.exists({ symbol })
  expect(exists).toBe(false)
  done()
})
