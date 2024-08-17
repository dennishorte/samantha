module.exports = {
  Thread,
  MessageFactory,
  tokenCountApprox
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

Thread.prototype.getNumTokensApprox = function() {
  const numWords = this
    .getMessages()
    .map(m => tokenCountApprox(m.content))
    .reduce((acc, x) => acc + x, 0)

  return numWords * 1.3
}

thread.prototype.getOriginalMessages = function() {
  return this
    .getMessages()
    .filter(m => !m.summary && !m.carryover)
}


////////////////////////////////////////////////////////////////////////////////
// Mutators

Thread.prototype.addMessage = function(user, message) {
  this.messages.push(message)
}

Thread.prototype.canAccess = function(userId) {
  return this.getUserId().equals(userId)
}


////////////////////////////////////////////////////////////////////////////////
// Static functions

function tokenCountApprox(text) {
  return text.split(/\s+/).length
}
