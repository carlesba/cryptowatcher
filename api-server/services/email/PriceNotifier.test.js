const {
  connectMockedDatabase,
  disconnectMockedDatabase
} = require('@config/tests')
const PriceNotifier = require('./PriceNotifier')

jest.mock('nodemailer')
const nodemailer = require('nodemailer')

const Cryptocurrency = require('@models/Cryptocurrency')
const MarketQuote = require('@models/MarketQuote')

beforeAll(connectMockedDatabase)
afterAll(disconnectMockedDatabase)

test(`Send an email with the latest price for every cryptocurrency`, async done => {
  // Spies
  const sendMailSpy = jest.fn(() => Promise.resolve())
  nodemailer.createTransport.mockReturnValue({
    sendMail: sendMailSpy
  })

  // Prepare database
  await Cryptocurrency.insertMany([
    { name: 'Bitcoin', coinMarketCapId: 1, symbol: 'BTC' },
    { name: 'Ethereum', coinMarketCapId: 1027, symbol: 'ETH' }
  ])
  const marketQuotes = [
    {
      symbol: 'ETH',
      price: 200,
      currency: 'EUR',
      timestamp: '2019-08-08T07:14:39.090Z'
    },
    {
      symbol: 'BTC',
      price: 10100,
      currency: 'EUR',
      timestamp: '2019-08-08T07:34:39.090Z'
    },
    {
      symbol: 'BTC',
      price: 10300,
      currency: 'EUR',
      timestamp: '2019-08-08T07:54:39.090Z'
    }
  ]
  await MarketQuote.insertMany(marketQuotes)

  // Call Subject Under Test
  const to = 'Jon Snow <jon@thewatch.dark>'
  const language = 'EN'
  PriceNotifier.send(to, language, error => {
    expect(error).toBe(null)
    expect(sendMailSpy).toHaveBeenCalledWith({
      // due to empty env variable
      from: undefined,
      to,
      subject: expect.any(String),
      text: expect.any(String)
    })
    done()
  })
})
