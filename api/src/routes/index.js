const db = require('../models/db.js')
const openai = require('../util/openai.js')
const { MessageFactory, Thread } = require('../util/thread.js')

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

  const userMessage = MessageFactory('user', text)
  const context = [...thread.getMessages(), userMessage]
  const response = await _getAssistantResponse(context)

  // Record the conversation
  await db.thread.append(thread.getId(), [
    userMessage,
    MessageFactory('assistant', response.content),
  ])

  res.json({
    status: 'success',
    thread: await db.thread.findById(thread.getId()),
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
  let data

  if (threadId) {
    data = await db.thread.findById(threadId)
  }
  else {
    data = await db.thread.create(userId)
  }

  const thread = new Thread(data)
  if (!thread.canAccess(userId)) {
    throw new Error('not authorized')
  }
  return thread
}

async function _getAssistantResponse(messages) {
  const response = await openai.complete(messages)
  return {
    role: 'assistant',
    content: response.message.content,
    timestamp: Date.now(),
  }
}
