const mongoose = require('mongoose')
const logger = require('@config/logger')

module.exports = function connect() {
  return mongoose.connect(process.env.MONGO_URL).then(() => {
    logger.info('Mongoose connected successfully to ' + process.env.MONGO_URL)
  })
}
