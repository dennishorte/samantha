const db = require('../models/db.js')
const threadlib = require('./thread.js')


const Context = {}
module.exports = Context


Context.assemble = function(threads) {
  const messages = threads.flatMap(t => t.getMessages())
  return messages
}


Context.latest = async function(userId) {
  const data = await db.thread.findLatestStms(userId, 5)
  return data.map(d => new threadlib.Thread(d))
}
