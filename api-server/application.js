require('dotenv').config()
require('module-alias/register')
const logger = require('@config/logger')

const redis = require('@infrastructure/redis')
const connectDb = require('@infrastructure/db')
const startWebServer = require('./api/endpoints')
const scheduler = require('@config/scheduler')

const { NODE_ENV } = process.env
logger.info(`[application] NODE_ENV ${NODE_ENV}`)

async function start() {
  try {
    await redis.connect()
    await connectDb()
    await startWebServer()
    scheduler()
    logger.info('[application] all systems up!')
  } catch (error) {
    logger.error(`[application] Couldn't start all services`)
    logger.error('[application] ' + error.message)
  }
}

start()
