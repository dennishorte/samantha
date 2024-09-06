import topiclib from '../../src/util/topic.js'


describe('merge', function() {
  let source
  let into

  beforeEach(function() {
    source = {
      name: 'source-topic',
      messages: [
        {
          role: 'user',
          content: 'st-1',
          timestamp: 100,
        },
        {
          role: 'assistant',
          content: 'st-2',
          timestamp: 101
        },
        {
          role: 'user',
          content: 'st-3',
          timestamp: 500,
        },
        {
          role: 'assistant',
          content: 'st-4',
          timestamp: 501
        },
      ]
    }

    into = {
      name: 'into-topic',
      messages: [
        {
          role: 'user',
          content: 'it-1',
          timestamp: 200,
        },
        {
          role: 'assistant',
          content: 'it-2',
          timestamp: 201
        },
        {
          role: 'user',
          content: 'it-3',
          timestamp: 400,
        },
        {
          role: 'assistant',
          content: 'it-4',
          timestamp: 401
        },
      ],
    }

    topiclib.merge(source, into)
  })

  it('combines the messages in timestamp order', function() {
    const result = into.messages.map(x => x.content)
    expect(result).toEqual(['st-1', 'st-2', 'it-1', 'it-2', 'it-3', 'it-4', 'st-3', 'st-4'])
  })

  it('does not change the source', function() {
    const result = source.messages.map(x => x.content)
    expect(result).toEqual(['st-1', 'st-2', 'st-3', 'st-4'])
  })
})
