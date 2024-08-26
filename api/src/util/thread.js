const brain = require('./brain.js')


module.exports = {
  Thread,
  MessageFactory,
  threadDataFactory,
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

function threadDataFactory(data={}) {
  const defaults = {
    userId: null,
    name: 'new thread',
    messages: [],
    nextThreadId: null,
    closed: false,
    createdTimestamp: Date.now(),
    closedTimestamp: null,
    parentId: null,
    childId: null,
  }

  return Object.assign(defaults, data)
}


////////////////////////////////////////////////////////////////////////////////
// Getters

Thread.prototype.getChildId = function() {
  return this.data.childId
}

Thread.prototype.getClosed = function() {
  return this.data.closed
}

Thread.prototype.getClosedTimestamp = function() {
  return this.data.closedTimestamp
}

Thread.prototype.getId = function() {
  return this.data._id
}

Thread.prototype.getName = function() {
  return this.data.name
}

Thread.prototype.getMessages = function() {
  return [...this.data.messages]
}

Thread.prototype.getParentId = function() {
  return this.data.parentId
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

Thread.prototype.getOriginalMessages = function() {
  return this
    .getMessages()
    .filter(m => !m.summary && !m.carryover)
}


////////////////////////////////////////////////////////////////////////////////
// Mutators
//  - Operations that just make simple state changes.

Thread.prototype.addMessage = function(message) {
  this.data.messages.push(message)
}

Thread.prototype.canAccess = function(userId) {
  return this.getUserId().equals(userId)
}

Thread.prototype.setClosed = function(bool) {
  this.data.closed = bool
}

Thread.prototype.setClosedTimestamp = function(timestamp) {
  this.data.closedTimestamp = timestamp
}

Thread.prototype.setName = function(name) {
  this.data.name = name
}

Thread.prototype.setParent = function(thread) {
  this.data.parentId = thread.getId()
}

Thread.prototype.setChild = function(thread) {
  this.data.childId = thread.getId()
}


////////////////////////////////////////////////////////////////////////////////
// Actions
//  - Operations that do more than just make simple state changes.

/*
   Closes this thread and creates a new thread that includes a summary of the content of this thread.
   It is expected that the this thread will be kept in memory immediately following the closing of this thread
   in order for the conversation to continue smoothly.

   This function does not update the database.
 */
Thread.prototype.close = async function() {
  this.setClosed(true)
  this.setClosedTimestamp(Date.now())

  const newThread = new Thread(threadDataFactory())

  const summaryRequest = MessageFactory('user', 'Create a summary of our recent conversation.')
  const summaryResponse = await this._summarizeThread(this)
  summaryRequest.summary = true
  summaryResponse.summary = true
  newThread.addMessage(summaryRequest)
  newThread.addMessage(summaryResponse)

  newThread.setParent(this)
  this.setChild(newThread)

  const nameTokens = this.getName().split('-')
  const counter = parseInt(nameTokens.pop())
  newThread.setName(nameTokens.join('-') + '-' + (counter + 1))

  return {
    prev: this,
    next: newThread,
  }
}


////////////////////////////////////////////////////////////////////////////////
// Private methods

Thread.prototype._summarizeThread = async function(thread) {
  const messages = thread.getOriginalMessages()
  const { summary } = await brain.summarize(messages)
  const summaryMessage = MessageFactory('assistant', summary)
  summaryMessage.summary = true
  return summaryMessage
}


////////////////////////////////////////////////////////////////////////////////
// Local functions

function tokenCountApprox(text) {
  return text.split(/\s+/).length
}
