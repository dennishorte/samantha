const openai = require('./openai.js')

test('complete', async () => {
  const messages = [{
    role: 'user',
    content: 'hello',
  }]
  const result = await openai.complete(messages)

  expect(result.finish_reason).toBe('stop')
  expect(result.message).toBeDefined()
  expect(result.message.role).toBe('assistant')
  expect(typeof result.message.content).toBe('string')
})
