import { ChromaClient } from 'chromadb'

import fs from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'

import chroma from '../../src/util/chroma.js'

const testClient = new ChromaClient()
const testCollections = []


function mockEmbed(string) {
  switch (string) {
    case 'orange':    return [1, 0, 0, 1, 0, 0];
    case 'pineapple': return [0, 1, 0, 1, 0, 0];
    case 'book':      return [0, 0, 1, 1, 0, 0];
    case 'florida':   return [1, 0, 0, 0, 1, 0];
    case 'hawaii':    return [0, 1, 0, 0, 1, 0];
    case 'library':   return [0, 0, 1, 0, 0, 1];
    default:
      throw new Error('Unhandled test string')
  }
}

function MockEmbedder() {}
MockEmbedder.prototype.generate = (strings) => strings.map(s => mockEmbed(s))


afterAll(async () => {
  for (const name of testCollections) {
    await testClient.deleteCollection({ name })
  }
})

// This will generate a new collection with a random name.
// All test collections will be deleted during the afterAll hook for this test file.
async function getTestCollection() {
  const collectionName = 'test_' + uuidv4()
  testCollections.push(collectionName)

  const collection = await testClient.createCollection({
    name: collectionName,
    embeddingFunction: new MockEmbedder()
  })

  return new chroma.Collection(collection)
}

describe('basic DB integration tests', () => {
  it('returns semantically ordered results', async () => {
    const coll = await getTestCollection()

    await coll.insert([
      {
        id: 'id1',
        document: 'orange',
      },
      {
        id: 'id2',
        document: 'pineapple',
      },
      {
        id: 'id3',
        document: 'book',
      },
    ])

    const libraryResponse = await coll.findBy({ texts: ['library'] })
    expect(libraryResponse[0].matches.length).toBe(2)
    expect(libraryResponse[0].matches[0].text).toBe('book')

    const hawaiiResponse = await coll.findBy({ texts: ['hawaii'] })
    expect(hawaiiResponse[0].matches.length).toBe(2)
    expect(hawaiiResponse[0].matches[0].text).toBe('pineapple')

    const floridaResponse = await coll.findBy({ texts: ['florida'] })
    expect(floridaResponse[0].matches.length).toBe(2)
    expect(floridaResponse[0].matches[0].text).toBe('orange')
  })

  it('can fetch embedding only entries with text', async () => {
    const coll = await getTestCollection()

    const insertItems = [
      { id: 'book', embedding: mockEmbed('book') },
      { id: 'orange', embedding: mockEmbed('orange') },
      { id: 'pineapple', embedding: mockEmbed('pineapple') },
    ]

    await coll.insert(insertItems)

    const libraryResponse = await coll.findBy({ texts: ['library'] })
    expect(libraryResponse[0].matches.length).toBe(2)
    expect(libraryResponse[0].matches[0].id).toBe('book')

    const hawaiiResponse = await coll.findBy({ texts: ['hawaii'] })
    expect(hawaiiResponse[0].matches.length).toBe(2)
    expect(hawaiiResponse[0].matches[0].id).toBe('pineapple')

    const floridaResponse = await coll.findBy({ texts: ['florida'] })
    expect(floridaResponse[0].matches.length).toBe(2)
    expect(floridaResponse[0].matches[0].id).toBe('orange')

  })

  it('can fetch embedding only entries with embeddings', async () => {
    const coll = await getTestCollection()

    const insertItems = [
      { id: 'book', embedding: mockEmbed('book') },
      { id: 'orange', embedding: mockEmbed('orange') },
      { id: 'pineapple', embedding: mockEmbed('pineapple') },
    ]

    await coll.insert(insertItems)

    const libraryResponse = await coll.findBy({ embeddings: [mockEmbed('library')] })
    expect(libraryResponse[0].matches.length).toBe(2)
    expect(libraryResponse[0].matches[0].id).toBe('book')

    const hawaiiResponse = await coll.findBy({ embeddings: [mockEmbed('hawaii')] })
    expect(hawaiiResponse[0].matches.length).toBe(2)
    expect(hawaiiResponse[0].matches[0].id).toBe('pineapple')

    const floridaResponse = await coll.findBy({ embeddings: [mockEmbed('florida')] })
    expect(floridaResponse[0].matches.length).toBe(2)
    expect(floridaResponse[0].matches[0].id).toBe('orange')

  })
})
