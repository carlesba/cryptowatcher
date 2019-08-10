const redis = require('redis')
const logger = require('@config/logger')
const apicache = require('apicache')
const { REDIS_URL } = process.env

let client
let middlewareCache

function connect() {
  return new Promise(function(resolve) {
    client = redis.createClient(REDIS_URL)
    middlewareCache = apicache.options({ redisClient: client }).middleware
    client.on('connect', function() {
      logger.info(`[redis] client connected successfully to ${REDIS_URL}:6379`)
      resolve()
    })
    client.on('error', function(error) {
      logger.error(`[redis] ${error.message}`)
    })
  })
}

module.exports = {
  connect,
  client,
  getMiddleware() {
    return middlewareCache
  }
}
