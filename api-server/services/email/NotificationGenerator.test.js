const NotificationGenerator = require('./NotificationGenerator')

test(`Throws an error when language is not supported`, () => {
  expect(() => {
    NotificationGenerator.generateFrom('RU')
  }).toThrow('Unsupported language')
})

test(`Throws an error when marketQuotes are not passed`, () => {
  expect(() => {
    NotificationGenerator.generateFrom('EN', [])
  }).toThrow('Missing market quotes')
})

test(`Creates subject and body with last prices from a list of marketQuotes`, () => {
  const marketQuotes = [
    {
      symbol: 'BTC',
      currency: 'EUR',
      price: 10100.894,
      timestamp: '2019-08-08T07:14:39.090Z'
    },
    {
      symbol: 'ETH',
      currency: 'EUR',
      price: 180.894,
      timestamp: '2019-08-08T07:14:39.090Z'
    }
  ]
  const language = 'ES'

  const { subject, body } = NotificationGenerator.generateFrom(
    language,
    marketQuotes
  )
  expect(subject).toBe('Actualización de precios de criptomonedas')
  expect(body).toBe(
    'Aquí tienes los precios para las cryptomonedas a las 9:14:\nBTC: 10100.894 EUR\nETH: 180.894 EUR'
  )
})
