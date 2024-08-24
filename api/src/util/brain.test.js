const brain = require('./brain.js')

afterEach(() => {
  jest.clearAllMocks()
})

test('mock is working', async () => {
  const mock = jest.spyOn(brain, '_getChatCompletion')

  try {
    await brain.complete([{ role: 'user', content: 'hello' }])
  }
  catch (e) {}

  expect(mock).toHaveBeenCalled()
})


describe('complete', () => {
  test.skip('throws error if the response is missing required fields', async () => {

  })

  test.skip('call actual api', async () => {
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
})


describe('summarize', () => {
  test('throws if the returned value is not JSON', async () => {
    const mock = jest
      .spyOn(brain, '_getChatCompletion')
      .mockResolvedValue({ choices: [{ message: { content: 'bad response' } }] })

    await expect(async () => { await brain.summarize([{ role: 'user', content: 'hello' }]) })
      .rejects
      .toThrow(SyntaxError)

    expect(mock).toHaveBeenCalled()
  })

  const badResponses = [
    [{ summary: 'hello' }],
    [{ summary: [], keywords: [] }],
    [{ summary: 'hello', keywords: 'goodbye' }],
    [{ keywords: [] }],
  ]

  test.each(badResponses)('throws if the generated JSON is missing required fields', async (msg) => {
    const mock = jest
      .spyOn(brain, '_getChatCompletion')
      .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify(msg) } }] })

    await expect(async () => { await brain.summarize([{ role: 'user', content: 'hello' }]) })
        .rejects
        .toThrow('Invalid response format')

    expect(mock).toHaveBeenCalled()
  })

  test('throws before calling the model if the context is empty', async () => {
    const mock = jest.spyOn(brain, '_getChatCompletion')
    await expect(async () => { await brain.summarize() }).rejects.toThrow('empty context')
    await expect(async () => { await brain.summarize([]) }).rejects.toThrow('empty context')
    expect(mock).not.toHaveBeenCalled()
  })
})
