const brain = require('./brain.js')
const threadlib = require('./thread.js')

const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

const mock = jest
  .spyOn(brain, 'summarize')
  .mockResolvedValue(
    {
      summary: loremIpsum,
      keywords: ['lorem ipsum', 'samantha'],
    }
  )


function longTestThreadFixture() {
  const thread = new threadlib.Thread(threadlib.threadDataFactory({
    name: 'stm-1',
    userId: 'test-user',
  }))
  return thread
}


describe('close', () => {
  test('the old thread is marked as closed', async () => {
    const thread = longTestThreadFixture()
    await thread.close()

    expect(thread.getClosed()).toBe(true)
    expect(thread.getClosedTimestamp()).not.toBeNull()
  })

  test('the old thread is linked to its child', async () => {
    const thread = longTestThreadFixture()
    const { next } = await await thread.close()

    expect(thread.getChildId()).toBe(next._id)
    expect(thread.getParentId()).toBe(null)
  })

  test('the new thread is not closed', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.getClosed()).toBe(false)
    expect(next.getClosedTimestamp()).toBeNull()
  })

  test('the new thread is linked to its parent', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.getChildId()).toBe(null)
    expect(next.getParentId()).toBe(thread._id)
  })

  test('the new thread has a name incremented one from its parent', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(thread.getName()).toBe('stm-1')
    expect(next.getName()).toBe('stm-2')
  })

  test('the new thread contains a summary of the parent', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    const messages = next.getMessages()

    expect(messages.length).toBe(2)
    expect(messages[0].summary).toBe(true)
    expect(messages[1].summary).toBe(true)
    expect(messages[0].content).toBe('Create a summary of our recent conversation.')
    expect(messages[1].content).toBe(loremIpsum)
  })

  test('new thread has the same userId as the prev thread', async () => {
    const thread = longTestThreadFixture()
    const { next } = await thread.close()

    expect(next.userId).toBe(thread.userId)
  })
})
