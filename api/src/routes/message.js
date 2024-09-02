import brain from '../util/brain.js'
import chroma from '../util/chroma.js'
import context from '../util/context.js'
import db from '../models/db.js'
import threadlib from '../util/thread.js'
import util from '../util/util.js'


export default Message

async function Message(req, res) {
  const text = _ensureText(req.body.text)
  const stm = await _getLatestMemories(req.body.userId)
  const latest = util.array.last(stm)
  latest.addMessage(threadlib.MessageFactory('user', text))

  const messages = context.assemble(stm)
  const response = await _getAssistantResponse(messages)
  latest.addMessage(threadlib.MessageFactory('assistant', response.content))

  db.thread.save(latest)

  await _embedLatestMessages(latest)

  // Check if it is time to start a new threadlib.
  await _maybeStartNewThread(latest)

  const updatedStm = await _getLatestMemories(req.body.userId, true)

  res.json({
    status: 'success',
    threads: updatedStm,
  })
}


////////////////////////////////////////////////////////////////////////////////
// Helpers


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

async function _getAssistantResponse(messages) {
  const response = await brain.complete(messages)
  return {
    role: 'assistant',
    content: response.message.content,
    timestamp: Date.now(),
  }
}

async function _getLatestMemories(userId, raw=false) {
  const existing = await db.thread.findLatestStms(userId, 5)

  let output

  if (existing.length > 0) {
    output = existing
  }
  else {
    output = [
      threadlib.threadDataFactory({ userId, name: 'stm-1' })
    ]
  }

  if (raw) {
    return output
  }
  else {
    return output.map(x => new threadlib.Thread(x))
  }
}

async function _maybeStartNewThread(thread) {
  if (thread.getNumTokensApprox() >= 10000) {
    const { prev, next } = await thread.close()

    await db.thread.save(prev)
    const nextSaved = await db.thread.createFrom(next)

    return new threadlib.Thread(nextSaved)
  }
}

async function _embedLatestMessages(stm) {
  const messages = stm.getMessages()
  const userMessage = messages[messages.length - 2].content
  const samMessage = messages[messages.length - 1].content

  const makeId = (index) => stm.getId().toString() + '_' + index

  // Embed the user prompt and response and store them in the vector DB with links to the active thread.
  const [userEmbed, samEmbed] = await brain.embed([userMessage, samMessage])
  const coll = await chroma.getThreadCollection()
  await coll.insert([
    {
      id: makeId(messages.length - 2),
      embedding: userEmbed,
      metadata: {
        threadId: stm.getId(),
        userId: stm.getUserId()
      },
    },
    {
      id: makeId(messages.length - 1),
      embedding: samEmbed,
      metadata: {
        threadId: stm.getId(),
        userId: stm.getUserId()
      },
    },
  ])
}
