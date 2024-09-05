import { ObjectId } from 'mongodb'
import util from '../util/util.js'

export default TopicService

function TopicService(client) {
  this._client = client
  this._db = this._client.db('sam')
  this._coll = this._db.collection('topic')
}


function _factory(userId, name) {
  return {
    name,
    userId,
    messages: [],
    parent: {
      id: null,
      name: null,
    },
    children: [],
  }
}

TopicService.prototype.create = async function(userId, name, messages) {
  const topic = _factory(userId, name)
  topic.messages = messages || []
  const result = await this._coll.insertOne(topic)
  return await this._coll.findOne({ _id: result.insertedId })
}


TopicService.prototype.findByUserId = async function(userId, projection={}) {
  const cursor = await this._coll.find({ userId }, projection)
  const array = await cursor.toArray()
  return array
}


TopicService.prototype.updateMany = async function(userId, groups) {
  util.assert(userId instanceof ObjectId, "Invalid user ID received")

  const groupNames = Object.keys(groups)
  const existingCursor = await this._coll.find({ name: { $in: groupNames } })
  const existing = await existingCursor.toArray()

  for (const [name, utterances] of Object.entries(groups)) {
    let topic

    const messages = utterances.flat()
    const exist = existing.find(x => x.name === name)

    if (exist) {
      topic = exist
      exist.messages = [...exist.messages, ...messages]

      // Add the messages to the existing topic
      await this._coll.replaceOne(
        { _id: exist._id },
        exist
      )
    }
    else {
      topic = await this.create(userId, name, messages)
    }

    // TODO: Check if the topic needs additional processing, such as splitting into sub-topics.
  }
}
