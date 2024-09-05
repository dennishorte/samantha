import threadlib from '../util/thread.js'

export default ThreadService

function ThreadService(client) {
  this._client = client
  this._db = this._client.db('sam')
  this._coll = this._db.collection('thread')
}


ThreadService.prototype.findById = async function(threadId) {
  return await this._coll.findOne({ _id: threadId })
}

ThreadService.prototype.findByUserId = async function(userId) {
  const cursor = await this._coll.find({ userId })
  const threads = await cursor.toArray()
  return threads
}

ThreadService.prototype.findLatestStms = async function(userId, count) {
  const cursor = await this
    ._coll
    .find({ userId })
    .sort({ createdTimestamp: 1 })
    .limit(count)
  const threads = await cursor.toArray()
  return threads

}

ThreadService.prototype.append = async function(threadId, message) {
  if (Array.isArray(message)) {
    return await this._coll.updateOne(
      { _id: threadId },
      { $push: { messages: { $each: message }}},
    )
  }
  else {
    return await this._coll.updateOne(
      { _id: threadId },
      { $push: { messages: message }},
    )
  }
}

ThreadService.prototype.create = async function(userId, name='new thread') {
  const data = threadlib.threadDataFactory({ userId, name })
  const insertResult = await this._coll.insertOne(data)
  if (!insertResult.insertedId) {
    throw new Error('thread creation failed')
  }
  return await ThreadService.prototype.findById(insertResult.insertedId)
}

ThreadService.prototype.createFrom = async function(thread) {
  const insertResult = await this._coll.insertOne(thread.data)
  if (!insertResult.insertedId) {
    throw new Error('thread creation failed')
  }
  return await ThreadService.prototype.findById(insertResult.insertedId)
}

ThreadService.prototype.save = async function(thread) {
  const result = await this._coll.replaceOne(
    { _id: thread.getId() },
    thread.data,
  )

  if (result.matchedCount !== 1) {
    throw new Error('Failed to save thread')
  }
}

ThreadService.prototype.setProcessed = async function(thread) {
  await this._coll.updateOne(
    { _id: thread.getId() },
    {
      $set: {
        processed: true,
        processedTimestamp: Date.now(),
      }
    }
  )
}
