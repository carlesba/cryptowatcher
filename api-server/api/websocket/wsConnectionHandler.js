const logger = require('@config/logger')

const MAX_SYMBOL_LENGTH = 8
function incomingMessageValidator(message) {
  return typeof message === 'string' && message.length < MAX_SYMBOL_LENGTH
}

module.exports = function connectionHandler(bus, websocket) {
  let subscribedSymbol
  websocket.on('message', function inconming(symbol) {
    if (incomingMessageValidator(symbol)) {
      logger.silly('[websocket-connectionHandler] new message ' + symbol)
      subscribedSymbol = symbol
    }
  })
  function handleNewMarketQuote(eventPayload) {
    if (eventPayload.symbol === subscribedSymbol) {
      const { symbol, ...message } = eventPayload
      const stringifiedMarketQuote = JSON.stringify(message)
      logger.silly(
        '[websocket-connectionHandler] notification ' + stringifiedMarketQuote
      )
      websocket.send(stringifiedMarketQuote)
    }
  }
  bus.on('NEW_MARKET_QUOTE', handleNewMarketQuote)
  websocket.onclose = function() {
    logger.silly('[websocket-connectionHandler] notification')
    bus.off('NEW_MARKET_QUOTE', handleNewMarketQuote)
  }
}
