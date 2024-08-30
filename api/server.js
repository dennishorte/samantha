require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')

const middleware = require('./src/middleware.js')
const routes = require('./src/routes')

const app = express()
const port = 3001

app.use(express.static(path.join(__dirname, '../app/dist')))
app.use(middleware.authenticate)
app.use(bodyParser.json({ limit: "5kb" }))
app.use(middleware.coerceIds)


// Guest routes
app.post('/api/guest/login', routes.login)


app.post('/api/message', routes.message)
app.post('/api/threads', routes.threads)
app.post('/api/process/topics', routes.processTopics)
app.post('/api/process/apply', routes.processApply)


////////////////////////////////////////////////////////////
// Initialize

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`)
})
