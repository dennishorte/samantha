import brain from '../../../src/util/brain.js'
import threadlib from '../../../src/util/thread.js'

const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'


describe('close', () => {
  beforeAll(function() {
    const mock = spyOn(brain, 'summarize')
    mock.and.returnValue(Promise.resolve({
      summary: loremIpsum,
      keywords: ['lorem ipsum', 'samantha'],
    }))
  })


  function longTestThreadFixture() {
    const thread = new threadlib.Thread(threadlib.threadDataFactory({
      name: 'stm-1',
      userId: 'test-user',
    }))
    return thread
  }

  it('the old thread is marked as closed', async () => {
    const thread = longTestThreadFixture()
    await thread.close()

    expect(thread.getClosed()).toBe(true)
    expect(thread.getClosedTimestamp()).not.toBeNull()
  })

  it('new thread has not been saved, so has no id', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.getId()).toBeUndefined()
    expect(thread.getChildId()).toBeNull()
  })

  it('the new thread is not closed', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.getClosed()).toBe(false)
    expect(next.getClosedTimestamp()).toBeNull()
  })

  it('the new thread is linked to its parent', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.getChildId()).toBe(null)
    expect(next.getParentId()).toBe(thread._id)
  })

  it('the new thread has a name incremented one from its parent', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(thread.getName()).toBe('stm-1')
    expect(next.getName()).toBe('stm-2')
  })

  it('the new thread contains a summary of the parent', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    const messages = next.getMessages()

    expect(messages.length).toBe(2)
    expect(messages[0].summary).toBe(true)
    expect(messages[1].summary).toBe(true)
    expect(messages[0].content).toBe('Create a summary of our recent conversation.')
    expect(messages[1].content).toBe(loremIpsum)
  })

  it('new thread has the same userId as the prev thread', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.userId).toBe(thread.userId)
  })
})
