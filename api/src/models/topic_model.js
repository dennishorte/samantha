import { ObjectId } from 'mongodb'
import MongoUtil from '../util/mongo.js'
import util from '../util/util.js'

const database = MongoUtil.client.db('sam')
const topicCollection = database.collection('topic')


const Topic = {}
export default Topic


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


Topic.findByUserId = async function(userId, projection={}) {
  const cursor = await topicCollection.find({ userId }, projection)
  const array = await cursor.toArray()
  return array
}


Topic.updateMany = async function(userId, groups) {
  util.assert(userId instanceof ObjectId, "Invalid user ID received")

  const groupNames = Object.keys(groups)
  const existingCursor = await topicCollection.find({ name: { $in: groupNames } })
  const existing = await existingCursor.toArray()

  for (const [name, utterances] of Object.entries(groups)) {
    let topic

    const messages = utterances.flat()
    const exist = existing.find(x => x.name === name)

    if (exist) {
      topic = exist
      exist.messages = [...exist.messages, ...messages]

      // Add the messages to the existing topic
      await topicCollection.updateOne(
        { _id: exist._id },
        exist
      )
    }
    else {
      // Create a new topic
      topic = _factory(userId, name)
      topic.messages = messages
      await topicCollection.insertOne(topic)
    }

    // TODO: Check if the topic needs additional processing, such as splitting into sub-topics.
  }
}
