
module.exports = {
  Thread,
  findById,
}

function Thread() {
  this.userIds = []
  this.messages = []
}

Thread.prototype.canAccess = function(user) {
  return true
  return this.users.find(id => id === user._id)
}

Thread.prototype.addMessage = function(user, message) {
  console.log('received:\n' + message)
}


function findById(threadId) {
  return new Thread()
}
