const { createLogger, format, transports } = require('winston')

let level
switch (process.env.NODE_ENV) {
  case 'production':
    level = 'info'
    break
  case 'test':
    level = 'none'
    break
  default:
    level = 'silly'
    break
}
module.exports = createLogger({
  level,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
})
