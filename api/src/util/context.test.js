const context = require('./context.js')
const db = require('../models/db.js')
const thread = require('./thread.js')
const util = require('./util.js')


// These tests aren't really meaningful if the search and sort is done directly on the DB call.
describe.skip('latest', () => {
  const mock = jest.spyOn(db.thread, 'findByUserId')

  afterEach(async () => {
    await jest.clearAllMocks()
  })


  test('gets the five most recent stm threads, sorted by age desc', async () => {
    // Setup the mock database
    const manyThreads = []
    for (let i = 0; i < 8; i++) {
      manyThreads.push(thread.threadDataFactory({
        name: 'stm-' + i,
      }))
    }
    util.array.shuffle(manyThreads)
    mock.mockResolvedValue(manyThreads)

    // Test the function
    const result = await context.latest('fake-user-id')
    const resultNames = results.map(x => x.name)

    expect(resultNames).toStrictEqual(['stm-3', 'stm-4', 'stm-5', 'stm-6', 'stm-7'])
  })

  test('does not get non-stm threads', () => {

  })
})
