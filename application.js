require('dotenv').config()
require('module-alias/register')
const logger = require('@config/logger')

const connectDb = require('./infrastructure/db')
const startWebServer = require('./api/endpoints')
const scheduler = require('./config/scheduler')

async function start() {
  try {
    await connectDb()
    await startWebServer()
    scheduler()
    logger.info('[application] all systems up!')
  } catch (error) {
    logger.error(`[application] Couldn't start all services`)
    logger.error(error.message)
  }
}

start()
