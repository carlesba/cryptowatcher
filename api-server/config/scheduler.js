const cron = require('node-cron')
const MarketQuotesUpdater = require('@services/cryptocurrencies/MarketQuotesUpdater')
const PriceNotifier = require('@services/email/PriceNotifier')
const logger = require('@config/logger')

const EVERY_MINUTE = '* * * * *'
const EVERY_HOUR = '* 1 * * *'

module.exports = function scheduler(eventBus) {
  if (!eventBus) {
    throw new Error('Missing event bus')
  }
  cron.schedule(EVERY_MINUTE, function() {
    logger.info('[scheduler] Update Market Quotes')
    MarketQuotesUpdater.update(function(error, marketQuotes) {
      if (error) {
        logger.error(
          '[scheduler] MarketQuoteUpdater found error: ',
          error.message
        )
        return
      }
      if (!marketQuotes) {
        logger.info(`[scheduler] MarketQuoteUpdater couldn't find marketQuotes`)
        return
      }
      marketQuotes.forEach(marketQuote => {
        eventBus.emit('NEW_MARKET_QUOTE', marketQuote)
      })
    })
  })
  logger.info(
    '[scheduler] Update Market Quotes has been scheduled to run every minute'
  )

  cron.schedule(EVERY_HOUR, function() {
    const addressTo = 'dev-test@team.bit2me.com'
    const language = 'EN'
    PriceNotifier.send(addressTo, language, function(error) {
      if (error) {
        logger.error(
          '[scheduler] Error when sending Price Notification in English: ' +
            error.message
        )
      }
    })
  })
  logger.info(
    '[scheduler] Notify Prices to dev-test@team.bit2me.com every hour in English'
  )

  cron.schedule(EVERY_HOUR, function() {
    const addressTo = 'dev-test@team.bit2me.com'
    const language = 'ES'
    PriceNotifier.send(addressTo, language, function(error) {
      if (error) {
        logger.error(
          '[scheduler] Error when sending Price Notification in Spanish: ' +
            error.message
        )
      }
    })
  })
  logger.info(
    '[scheduler] Notify Prices to dev-test@team.bit2me.com every hour in Spanish'
  )

  logger.info('[scheduler] scheduler started correctly')
}
