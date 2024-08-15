module.exports = {
  Thread,
  MessageFactory,
}

function MessageFactory(role, text) {
  return {
    role,
    content: text,
    timestamp: Date.now()
  }
}

function Thread(data) {
  this.data = data
}


////////////////////////////////////////////////////////////////////////////////
// Getters

Thread.prototype.getId = function() {
  return this.data._id
}

Thread.prototype.getMessages = function() {
  return [...this.data.messages]
}

Thread.prototype.getUserId = function() {
  return this.data.userId
}


////////////////////////////////////////////////////////////////////////////////
// Mutators

Thread.prototype.canAccess = function(userId) {
  return this.getUserId().equals(userId)
}

Thread.prototype.addMessage = function(user, message) {
  this.messages.push(message)
}