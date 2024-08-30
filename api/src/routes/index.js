const brain = require('../util/brain.js')
const context = require('../util/context.js')
const db = require('../models/db.js')
const threadlib = require('../util/thread.js')
const util = require('../util/util.js')


module.exports = {
  login,
  message: require('./message.js').message,
  threads,
  processApply,
  processTopics,
}

async function _createFirstUserIfNone(email, password) {
  if (await db.user.isEmpty()) {
    console.log('User db is empty. Creating first user.')
    const user = await db.user.create({
      email,
      password,
      slack: null,
    })
  }
}

async function login(req, res) {
  await _createFirstUserIfNone(req.body.user.email, req.body.user.password)
  const user = await db.user.checkPassword(req.body.user.email, req.body.user.password)

  if (!user) {
    res.json({
      status: 'error',
      message: 'User not found',
    })
  }
  else if (user.deactivated) {
    res.json({
      status: 'error',
      message: `User (${req.body.email}) has been deactivated`,
    })
  }
  else {
    res.json({
      status: 'success',
      user: {
        _id: user._id,
        email: user.email,
        token: user.token,
      },
    })
  }
}

async function threads(req, res) {
  util.assert(req.user._id.equals(req.body.userId), 'Access denied')

  const latest = await context.latest(req.body.userId)

  res.json({
    status: 'success',
    threads: latest.map(t => t.data)
  })
}

async function processTopics(req, res) {
  const thread = await _threadFromReq(req)
  const topics = await brain.topics(thread)

  res.json({
    status: 'success',
    topics: topics,
  })
}

async function processApply(req, res) {
  const thread = await _threadFromReq(req)
  const topics = req.body.topics
  const groups = await brain.groupByTopics(thread, topics)
  res.json({
    status: 'success',
    groups,
  })
}


async function _threadFromReq(req) {
  const threadData = await db.thread.findById(req.body.threadId)
  const thread = new threadlib.Thread(threadData)
  util.assert(req.user._id.equals(thread.getUserId()), 'Access denied')
  return thread
}
