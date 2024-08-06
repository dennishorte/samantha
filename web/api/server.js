require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')

const app = express()
const port = 3001

app.use(express.static(path.join(__dirname, '../app/dist')))
app.use(bodyParser.json({ limit: "5kb" }))

app.get('/test', (req, res) => {
  res.json({ foo: 'bar' })
})


////////////////////////////////////////////////////////////
// Initialize

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`)
})
