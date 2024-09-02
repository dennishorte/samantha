import 'dotenv/config'

import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'

import middleware from './src/middleware.js'
import routes from './src/routes/index.js'

const app = express()
const port = 3001

app.use(express.static(path.join(import.meta.dirname, '../app/dist')))
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
