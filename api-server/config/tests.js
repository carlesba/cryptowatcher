const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

async function connectMockedDatabase() {
  mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getConnectionString()
  await mongoose.connect(mongoUri, { useNewUrlParser: true }, err => {
    if (err) console.error(err)
  })
}

async function disconnectMockedDatabase() {
  await mongoose.disconnect()
  await mongoServer.stop()
}

module.exports = {
  connectMockedDatabase,
  disconnectMockedDatabase
}
