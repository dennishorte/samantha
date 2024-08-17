const brain = require('./brain.js')


test('complete', async () => {
  const messages = [{
    role: 'user',
    content: 'hello',
  }]
  const result = await brain.complete(messages)

  expect(result.finish_reason).toBe('stop')
  expect(result.message).toBeDefined()
  expect(result.message.role).toBe('assistant')
  expect(typeof result.message.content).toBe('string')
})

describe('summarize', () => {
  test('retries if the wrong format is returned', () => {

  })

  test('throws an error if the wrong format is returned a second time', () => {

  })

  test('throws before calling the model if the context is empty', async () => {
    const mock = jest.spyOn(brain, '_callCompletionsCreateEndpoint')
    expect(async () => { await brain.summarize() }).rejects.toThrow()
    expect(async () => { await brain.summarize([]) }).rejects.toThrow()
    expect(brain._callCompletionsCreateEndpoint).not.toHaveBeenCalled()
  })
})
