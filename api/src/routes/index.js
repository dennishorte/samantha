const db = require('../models/db.js')
const { Message } = require('../util/thread.js')

module.exports = {
  login,
  message,
  threads,
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

async function message(req, res) {
  const text = _ensureText(req.body.text)
  const thread = await _getOrCreateThread(req.body.userId, req.body.threadId)

  await db.thread.append(thread._id, Message('user', text))

  res.json({
    status: 'success',
    thread: await db.thread.findById(thread._id),
  })
}

async function threads(req, res) {
  const threads = await db.thread.findByUserId(req.body.userId)
  console.log(threads)

  res.json({
    status: 'success',
    threads,
  })
}

function _ensureText(text) {
  if (!text) {
    throw new Error('no text')
  }

  text = text.trim()

  if (!text) {
    throw new Error('empty text')
  }

  return text
}

async function _getOrCreateThread(userId, threadId) {
  if (threadId) {
    const thread = await db.thread.getById(threadId)
    if (!thread.canAccess(user)) {
      throw new Error('not authorized')
    }
    return thread
  }
  else {
    return await db.thread.create(userId)
  }
}
