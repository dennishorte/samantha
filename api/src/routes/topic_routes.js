import brain from '../util/brain.js'
import db from '../models/db.js'
import mongoUtil from '../util/mongo.js'
import threadlib from '../util/thread.js'
import topiclib from '../util/topic.js'
import util from '../util/util.js'


export default {
  apply,
  combine,
  fetch,
  generate,
  rename,
}

async function generate(req, res) {
  const thread = await _threadFromReq(req)
  const topics = await brain.topics(thread)

  res.json({
    status: 'success',
    topics: topics,
  })
}

async function apply(req, res) {
  const thread = await _threadFromReq(req)
  const topics = req.body.topics
  const groups = await brain.groupByTopics(thread, topics)
  await db.thread.setProcessed(thread)
  await db.topic.updateMany(req.user._id, groups)
  const allTopics = await db.topic.findByUserId(req.user._id, { _id: 1, name: 1, })

  res.json({
    status: 'success',
    topics: allTopics
  })
}

async function combine(req, res) {
  const merge = await _topicFromReq(req, 'mergeId')
  const into = await _topicFromReq(req, 'intoId')

  topiclib.merge(merge, into)

  await db.topic.save(into)
  await db.topic.deactivate(merge._id)

  res.json({
    status: 'success',
  })
}

async function fetch(req, res) {
  const allTopics = await db.topic.findByUserId(req.user._id, { _id: 1, name: 1, })

  res.json({
    status: 'success',
    topics: allTopics
  })
}

async function rename(req, res) {
  const topic = await _topicFromReq(req)
  const newName = req.body.name.trim()

  if (!newName) {
    res.json({
      status: 'error',
      message: 'empty name',
    })
    return
  }

  topic.name = newName
  await db.topic.save(topic)

  res.json({
    status: 'success',
  })
}

async function _threadFromReq(req) {
  const threadData = await db.thread.findById(req.body.threadId)
  const thread = new threadlib.Thread(threadData)
  util.assert(req.user._id.equals(thread.getUserId()), 'Access denied')
  return thread
}

async function _topicFromReq(req, fieldName='topicId') {
  const topic = await db.topic.findById(req.body[fieldName])
  util.assert(req.user._id.equals(topic.userId), 'Access denied')
  return topic
}
