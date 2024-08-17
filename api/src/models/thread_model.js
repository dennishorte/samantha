const threadlib = require('../util/thread.js')

const databaseClient = require('../util/mongo.js').client
const database = databaseClient.db('sam')
const threadCollection = database.collection('thread')


const Thread = {}
module.exports = Thread


Thread.findById = async function(threadId) {
  return await threadCollection.findOne({ _id: threadId })
}

Thread.findByUserId = async function(userId) {
  const cursor = await threadCollection.find({ userId })
  const threads = await cursor.toArray()
  return threads
}

Thread.append = async function(threadId, message) {
  if (Array.isArray(message)) {
    return await threadCollection.updateOne(
      { _id: threadId },
      { $push: { messages: { $each: message }}},
    )
  }
  else {
    return await threadCollection.updateOne(
      { _id: threadId },
      { $push: { messages: message }},
    )
  }
}

Thread.close = async function(threadId, nextThreadId) {
  return await threadCollection.updateOne(
    { _id: threadId },
    {
      nextThreadId,
      closed: true,
    },
  )
}

Thread.create = async function(userId) {
  const insertResult = await threadCollection.insertOne({
    userId,
    messages: [],
    nextThreadId: null,
    closed: false,
  })
  if (!insertResult.insertedId) {
    throw new Error('thread creation failed')
  }
  return await Thread.findById(insertResult.insertedId)
}

Thread.save = async function(thread) {
  const result = await threadCollection.replaceOne(
    { _id: thread.getId() },
    thread.data
  )

  if (result.matchedCount !== 1) {
    throw new Error('Failed to save thread')
  }
}
