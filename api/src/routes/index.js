const chroma = require('../util/chroma.js')
const db = require('../models/db.js')
const brain = require('../util/brain.js')
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

  const updatedThread = new Thread(await db.thread.findById(thread.getId()))

  // Embed the user prompt and response and store them in the vector DB with links to the active thread.
  const [userEmbed, samEmbed] = brain.embed([text, response.content])
  chroma.insert([
    {
      id: updatedThread._id + (updatedThread.getMessages().length - 2),
      embedding: userEmbed,
      metadata: {
        threadId: updatedThread.getId(),
      },
    },
    {
      id: updatedThread._id + (updatedThread.getMessages().length - 1),
      embedding: samEmbed,
      metadata: {
        threadId: updatedThread.getId(),
      },
    },
  ])

  // Check if it is time to start a new thread.
  const newThread = await _maybeStartNewThread(updatedThread)

  res.json({
    status: 'success',
    thread: newThread.data,
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
  const response = await brain.complete(messages)
  return {
    role: 'assistant',
    content: response.message.content,
    timestamp: Date.now(),
  }
}

async function _maybeStartNewThread(thread) {
  if (thread.getNumTokensApprox() >= 10000) {
    const newThread = new Thread(await db.thread.create(thread.getUsedId()))
    await db.thread.close(thread.getId(), newThread.getId())
    const summaryMessage = await _summarizeThread(thread)

    // Select the end of the conversation
    const ending = []
    let tokenCount = 0
    for (const m of messages.reverse()) {
      ending.push(m)
      tokenCount += tokenCountApprox(m.content)

      // Always be sure to get the user message that prompted the assistant response.
      if (m.role === 'assistant') {
        continue
      }

      if (tokenCount >= 500) {
        break
      }
    }

    ending.push(summaryMessage)
    ending.reverse()
    newThread.data.messages = ending
    await db.thread.save(newThread)

    return newThread
  }
  else {
    return thread
  }
}

async function _summarizeThread(thread) {
  // Get a summary of the existing thread.
  const messages = thread.getOriginalMessages()
  const summary = await brain.summarize(messages)
  const summaryMessage = MessageFactory('user', summary)
  summaryMessage.summary = true
  return summaryMessage
}
