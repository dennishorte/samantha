const chroma = require('../util/chroma.js')
const context = require('../util/context.js')
const db = require('../models/db.js')
const brain = require('../util/brain.js')
const threadlib = require('../util/thread.js')


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
  const stm = await _getLatestStm(req.body.userId)
  stm.addMessage(threadlib.MessageFactory('user', text))

  const response = await _getAssistantResponse(stm.getMessages())
  stm.addMessage(threadlib.MessageFactory('assistant', response.content))

  db.thread.save(stm)

  // Embed the user prompt and response and store them in the vector DB with links to the active thread.
  const [userEmbed, samEmbed] = await brain.embed([text, response.content])
  const coll = await chroma.getThreadCollection()
  await coll.insert([
    {
      id: stm.getId().toString() + '_' + (stm.getMessages().length - 2),
      embedding: userEmbed,
      metadata: {
        threadId: stm.getId(),
      },
    },
    {
      id: stm.getId().toString() + '_' + (stm.getMessages().length - 1),
      embedding: samEmbed,
      metadata: {
        threadId: stm.getId(),
      },
    },
  ])

  // Check if it is time to start a new threadlib.
  const newThread = await _maybeStartNewThread(stm)

  res.json({
    status: 'success',
    thread: newThread.data,
  })
}

async function threads(req, res) {
  const latest = await context.latest(req.body.userId)

  res.json({
    status: 'success',
    threads: latest
  })
}


////////////////////////////////////////////////////////////////////////////////
// Local functions

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

async function _getLatestStm(userId) {
  const existing = await db.thread.findLatestStms(userId, 1)

  let data

  if (existing.length > 0) {
    data = existing[0]
  }
  else {
    data = threadlib.threadDataFactory({ userId, name: 'stm-1' })
  }

  const thread = new threadlib.Thread(data)
  if (!thread.canAccess(userId)) {
    throw new Error('not authorized')
  }
  return thread
}

async function _getAssistantResponse(messages) {
  const response = await brain.complete(messages)
  return {
    role: 'assistant',
    content: response.message.content,
    timestamp: Date.now(),
  }
}

async function _maybeStartNewThread(thread) {
  if (thread.getNumTokensApprox() >= 10000) {
    const { prev, next } = await thread.close()

    await db.thread.save(prev)
    const nextSaved = await db.thread.createFrom(next)

    return new threadlib.Thread(nextSaved)
  }
  else {
    return thread
  }
}
