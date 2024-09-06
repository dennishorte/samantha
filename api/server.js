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

app.post('/api/topics/apply', routes.topics.apply)
app.post('/api/topics/combine', routes.topics.combine)
app.post('/api/topics/fetch', routes.topics.fetch)
app.post('/api/topics/generate', routes.topics.generate)
app.post('/api/topics/rename', routes.topics.rename)


////////////////////////////////////////////////////////////
// Initialize

import db from './src/models/db.js'
import MongoUtil from './src/util/mongo.js'
db.initialize(MongoUtil.client)

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`)
})
