const db = require('../models/db.js')


const Context = {}
module.exports = Context


Context.assemble = function(threads) {
  const messages = threads.flatMap(t => t.getMessages())
  return messages
}


Context.latest = async function(userId) {
  return db.thread.findLatestStms(userId, 5)
}
