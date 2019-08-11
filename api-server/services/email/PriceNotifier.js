const nodemailer = require('nodemailer')
const logger = require('@config/logger')
const MarketQuote = require('@models/MarketQuote')
const Cryptocurrency = require('@models/Cryptocurrency')
const NotificationGenerator = require('./NotificationGenerator')

const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASS
const host = process.env.EMAIL_SMTP_HOST
const port = process.env.EMAIL_PORT
const emailFrom = process.env.EMAIL_FROM

async function send(to, language, callback) {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass }
    })
    const marketQuotes = await getLastMarketQuotes()
    const { body, subject } = NotificationGenerator.generateFrom(
      language,
      marketQuotes
    )
    await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      text: body
    })
    logger.info(`[PriceNotifier] Email sent to ${to} in ${language}`)
    callback(null)
  } catch (error) {
    logger.error(
      `[PriceNotifier] Error when sending email to ${to} in ${language}`
    )
    logger.error('[PriceNotifier] Error message: ' + error.message)
    callback(error)
  }
}

async function getLastMarketQuotes() {
  const currencies = await Cryptocurrency.find({})
  const marketQuotes = await Promise.all(
    currencies.map(currency => {
      const symbol = currency.symbol
      return MarketQuote.findOne({ symbol }, {}, { sort: { $natural: -1 } })
    })
  )
  return marketQuotes
}
module.exports = {
  send
}
