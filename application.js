require('dotenv').config()
require('module-alias/register')
const logger = require('@config/logger')

const connectDb = require('./infrastructure/db')
const startWebServer = require('./api/endpoints')

async function start() {
  try {
    await connectDb()
    await startWebServer()
    logger.info('all systems up!')
  } catch (error) {
    logger.error(`Couldn't start all services`)
    logger.error(error.message)
  }
}

start()
