const _ = require('lodash')
const EN_TRANSLATIONS = require('./EN.json')
const ES_TRANSLATIONS = require('./ES.json')

const TRANSLATIONS = {
  EN: EN_TRANSLATIONS,
  ES: ES_TRANSLATIONS
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const hour = date.getHours()
  const minutes = date.getMinutes()
  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString()
  return `${hour}:${paddedMinutes}`
}

function generateFrom(language, marketQuotes) {
  const translations = TRANSLATIONS[language]
  if (!translations) {
    throw new Error('Unsupported language')
  }
  if (!marketQuotes || marketQuotes.length === 0) {
    throw new Error('Missing market quotes')
  }
  const subject = translations.subject
  const bodyTemplate = _.template(translations.body)
  const time = formatTimestamp(marketQuotes[0].timestamp)
  let body = [
    bodyTemplate({ time }),
    ...marketQuotes.map(mq => {
      return `${mq.symbol}: ${mq.price} ${mq.currency}`
    })
  ]
  return {
    subject,
    body: body.join('\n')
  }
}

module.exports = {
  generateFrom
}
