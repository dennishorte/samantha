import brain from '../util/brain.js'
import db from '../models/db.js'
import mongoUtil from '../util/mongo.js'
import threadlib from '../util/thread.js'
import util from '../util/util.js'


export default {
  apply,
  fetch,
  generate,
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

async function fetch(req, res) {
  const allTopics = await db.topic.findByUserId(req.user._id, { _id: 1, name: 1, })

  res.json({
    status: 'success',
    topics: allTopics
  })
}

async function _threadFromReq(req) {
  const threadData = await db.thread.findById(req.body.threadId)
  const thread = new threadlib.Thread(threadData)
  util.assert(req.user._id.equals(thread.getUserId()), 'Access denied')
  return thread
}
