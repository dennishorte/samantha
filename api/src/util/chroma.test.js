const chroma = require('./chroma.js')


describe('basic DB integration tests', () => {
  test('fetches are semantically ordered', async () => {
    const coll = await chroma.initializeTestCollection()

    await coll.insert([
      {
        id: 'id1',
        document: 'This is an orange',
      },
      {
        id: 'id2',
        document: 'This is a pineapple',
      },
      {
        id: 'id3',
        document: 'This is a book',
      },
    ])

    const libraryResponse = await coll.findBy({ texts: ['library'] })
    expect(libraryResponse[0].matches.length).toBe(2)
    expect(libraryResponse[0].matches[0].text).toBe('This is a book')

    const hawaiiResponse = await coll.findBy({ texts: ['hawaii'] })
    expect(hawaiiResponse[0].matches.length).toBe(2)
    expect(hawaiiResponse[0].matches[0].text).toBe('This is a pineapple')

    const floridaResponse = await coll.findBy({ texts: ['florida'] })
    expect(floridaResponse[0].matches.length).toBe(2)
    expect(floridaResponse[0].matches[0].text).toBe('This is an orange')
  })
})
