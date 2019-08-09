const cron = require('node-cron')
const MarketQuotesUpdater = require('@services/cryptocurrencies/MarketQuotesUpdater')
const logger = require('@config/logger')

const EVERY_MINUTE = '* * * * *'

module.exports = function scheduler() {
  cron.schedule(EVERY_MINUTE, function() {
    logger.info('[scheduler] Update Market Quotes')
    MarketQuotesUpdater.update(function(error) {
      if (error) {
        logger.error(
          '[scheduler] MarketQuoteUpdater found error: ',
          error.message
        )
      }
    })
  })
  logger.info('[scheduler] Update Market Quotes scheduled to run every minute')

  logger.info('[scheduler] scheduler started correctly')
}
