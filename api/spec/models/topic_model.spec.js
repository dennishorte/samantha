////////////////////////////////////////////////////////////////////////////////
// Database mock
// TODO: move this into a helper file

import db from '../../src/models/db.js'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'


let mongod
let testUser

beforeAll(async () => {
  process.env.SECRET_KEY = 'test_key'

  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  const client = new MongoClient(uri)
  client.connect()
  await db.create(client)

  // Insert some fake data
  await db.user.create({ email: 'allen@example.com', password: 'allen' })
  await db.user.create({ email: 'betty@example.com', password: 'betty' })
  await db.user.create({ email: 'colin@example.com', password: 'colin' })
  await db.user.create({ email: 'daisy@example.com', password: 'daisy' })
})

// The Server can be stopped again with
afterAll(async () => {
  await mongod.stop()
})


////////////////////////////////////////////////////////////////////////////////
// Tests

describe('updateMany', () => {
  beforeAll(async () => {
    testUser = await db.user.findByEmail('allen@example.com')

    // Create a "pre-update" database state including an old record.
    await db.topic.create(testUser._id, 'old topic', [
      { role: 'user', content: 'message 1' },
      { role: 'assistant', content: 'response to message 1', },
    ])

    const newGroups = {
      topic1: [
        { role: 'user', content: 'topic1' },
        { role: 'assistant', content: 'response to topic 1' },
      ],

      topic2: [
        { role: 'user', content: 'topic2' },
        { role: 'assistant', content: 'response to topic 2' },
        { role: 'user', content: 'more topic 2' },
        { role: 'assistant', content: 'Yes, that is a good idea.' },
      ],

      'old topic': [
        { role: 'user', content: 'message 2' },
        { role: 'assistant', content: 'response to message 2' },
      ]
    }

    // Call the updateMany method that we will be testing.
    await db.topic.updateMany(testUser._id, newGroups)
  })

  it('creates new groups', async () => {
    const topics = await db.topic.findByUserId(testUser._id)
    expect(topics.map(x => x.name).sort()).toEqual(['old topic', 'topic1', 'topic2'])
  })

  it('adds userIds to new topics', async () => {
    const topics = await db.topic.findByUserId(testUser._id)
    const topic1 = topics.find(x => x.name === 'topic1')
    const topic2 = topics.find(x => x.name === 'topic2')
    expect(topic1.userId.equals(testUser._id)).toBe(true)
    expect(topic2.userId.equals(testUser._id)).toBe(true)
  })

  it('includes the messages in new topics', async () => {
    const topics = await db.topic.findByUserId(testUser._id)
    const topic1 = topics.find(x => x.name === 'topic1')
    const topic2 = topics.find(x => x.name === 'topic2')
    expect(topic1.messages).toEqual([
      { role: 'user', content: 'topic1' },
      { role: 'assistant', content: 'response to topic 1' },
    ])
    expect(topic2.messages).toEqual([
      { role: 'user', content: 'topic2' },
      { role: 'assistant', content: 'response to topic 2' },
      { role: 'user', content: 'more topic 2' },
      { role: 'assistant', content: 'Yes, that is a good idea.' },
    ])
  })

  it('appends messages to existing topics', async () => {
    const topics = await db.topic.findByUserId(testUser._id)
    const oldtopic = topics.find(x => x.name === 'old topic')
    expect(oldtopic.messages).toEqual([
      { role: 'user', content: 'message 1' },
      { role: 'assistant', content: 'response to message 1' },
      { role: 'user', content: 'message 2' },
      { role: 'assistant', content: 'response to message 2' },
    ])
  })
})
