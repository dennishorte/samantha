import brain from '../../src/util/brain.js'


describe('openai mock', function() {
  it('is working', async function() {
    const mock = spyOn(brain, '_complete')
    mock.and.callFake(() => 'mocked response')
    const response = await brain._complete()
    expect(response).toBe('mocked response')
    expect(mock).toHaveBeenCalled()
  })
})

describe('summarize', () => {
  it('throws before calling the model if the context is empty', async () => {
    const mock = spyOn(brain, '_complete')
    await expectAsync(brain.summarize()).toBeRejectedWith(new Error('empty context'))
    await expectAsync(brain.summarize([])).toBeRejectedWith(new Error('empty context'))
    expect(mock).not.toHaveBeenCalled()
  })
})
