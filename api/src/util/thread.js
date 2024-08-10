module.exports = {
  Thread,
  Message,
}

function Message(role, text) {
  return {
    role,
    text,
    timestamp: Date.now()
  }
}

function Thread(userId) {
  this.userIds = [userId]
  this.messages = []
}

Thread.prototype.canAccess = function(user) {
  return this.userIds.find(id => id === user._id)
}

Thread.prototype.addMessage = function(user, message) {
  this.messages.push(message)
}
