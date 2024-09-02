import threadlib from '../util/thread.js'
import MongoUtil from '../util/mongo.js'

const database = MongoUtil.client.db('sam')
const threadCollection = database.collection('thread')


const Thread = {
  coll: threadCollection
}
export default Thread


Thread.findById = async function(threadId) {
  return await threadCollection.findOne({ _id: threadId })
}

Thread.findByUserId = async function(userId) {
  const cursor = await threadCollection.find({ userId })
  const threads = await cursor.toArray()
  return threads
}

Thread.findLatestStms = async function(userId, count) {
  const cursor = await threadCollection
    .find({ userId })
    .sort({ createdTimestamp: 1 })
    .limit(count)
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

Thread.create = async function(userId, name='new thread') {
  const data = threadlib.threadDataFactory({ userId, name })
  const insertResult = await threadCollection.insertOne(data)
  if (!insertResult.insertedId) {
    throw new Error('thread creation failed')
  }
  return await Thread.findById(insertResult.insertedId)
}

Thread.createFrom = async function(thread) {
  const insertResult = await threadCollection.insertOne(thread.data)
  if (!insertResult.insertedId) {
    throw new Error('thread creation failed')
  }
  return await Thread.findById(insertResult.insertedId)
}

Thread.save = async function(thread) {
  const result = await threadCollection.replaceOne(
    { _id: thread.getId() },
    thread.data,
  )

  if (result.matchedCount !== 1) {
    throw new Error('Failed to save thread')
  }
}
