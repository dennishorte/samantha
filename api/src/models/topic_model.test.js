

describe('updateMany', () => {
  const mockUser = { _id: ObjectId('tbd') }

  beforeAll(async () => {
    const oldTopic = {
      name: 'old topic',
      userId: mockUser._id,
      messages: [
        { role: 'user', content: 'message 1' },
        { role: 'assistant', content: 'response to message 1', },
      ],
      parent: {
        id: null,
        name: null,
      },
      children: [],
    }

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

    // Create a "pre-update" database state including an old record.
    mockDb.topic.insert(oldTopic)

    // Call the updateMany method that we will be testing.
    await topic.updateMany(mockUser, newGroups)
  })

  test('new groups are created', async () => {
    const topics = await db.topic.findByUserId(mockUser._id)
    expect(topics.map(x => x.name).sort()).toStrictEqual(['old topic', 'topic1', 'topic2'])
  })

  test('user ids are set correctly on new topics', () => {
    const topics = await db.topic.findByUserId(mockUser._id)
    const topic1 = topics.find(x => x.name === 'topic1')
    const topic2 = topics.find(x => x.name === 'topic2')
    expect(topic1.userId.equals(mockUser._id)).toBe(true)
    expect(topic2.userId.equals(mockUser._id)).toBe(true)
  })

  test('messages are set correctly in new groups', () => {
    const topics = await db.topic.findByUserId(mockUser._id)
    const topic1 = topics.find(x => x.name === 'topic1')
    const topic2 = topics.find(x => x.name === 'topic2')
    expect(topic1.messages).toStrictEqual([
      { role: 'user', content: 'topic1' },
      { role: 'assistant', content: 'response to topic 1' },
    ])
    expect(topic2.messages).toStrictEqual([
      { role: 'user', content: 'more topic 2' },
      { role: 'assistant', content: 'Yes, that is a good idea.' },
      { role: 'user', content: 'topic1' },
      { role: 'assistant', content: 'response to topic 1' },
    ])
  })

  test('messages are set correctly in old groups', async () => {
    const topics = await db.topic.findByUserId(mockUser._id)
    const oldtopic = topics.find(x => x.name === 'old topic')
    expect(oldtopic.messages).toStrictEqual([
      { role: 'user', content: 'old topic' },
      { role: 'assistant', content: 'response to topic 1' },
    ])
  })
})