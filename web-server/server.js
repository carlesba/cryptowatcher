const express = require('express')
const app = express()
const { WEBSERVER_PORT } = process.env

app.use(express.static('dist'))

app.listen(WEBSERVER_PORT, () => {
  console.log(
    `[web-server] serving static files from /dist in port: ${WEBSERVER_PORT}`
  )
})
