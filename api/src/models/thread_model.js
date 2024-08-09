module.exports = {
  Thread,
  findById,
}

function Thread(userId) {
  this.userIds = [userId]
  this.messages = []
}

Thread.prototype.canAccess = function(user) {
  return this.userIds.find(id => id === user._id)
}

Thread.prototype.addMessage = function(user, message) {
  this.messages.push({
    role: 'user',
    userId: user._id,
    text: message,
    timestamp: Date.now()
  })
}


function findById(threadId) {
  return new Thread()
}
