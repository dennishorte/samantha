const { ChromaClient } = require("chromadb")

const chroma = require('./chroma.js')
const fs = require('node:fs')
const path = require('node:path')
const uuid = require('uuid')

const testClient = new ChromaClient()
const testCollections = []

afterAll(async () => {
  for (const name of testCollections) {
    await testClient.deleteCollection({ name })
  }
})

// This will generate a new collection with a random name.
// All test collections will be deleted during the afterAll hook for this test file.
async function getTestCollection() {
  const collectionName = 'test_' + uuid.v4()
  testCollections.push(collectionName)

  const collection = await testClient.createCollection({
    name: collectionName,
    embeddingFunction: new chroma.Embedder(),
  })

  return new chroma.Collection(collection)
}

function getTestEmbeddings() {
  const filepath = path.resolve(__dirname, './chroma.test.embeddings.json')
  const data = fs.readFileSync(filepath, 'utf8')
  return JSON.parse(data)
}


describe('basic DB integration tests', () => {
  test('fetches are semantically ordered', async () => {
    const coll = await getTestCollection()

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

  test('can fetch embedding only entries with text', async () => {
    const embeddings = getTestEmbeddings()
    const coll = await getTestCollection()

    const insertItems = [
      { id: 'book', embedding: embeddings.book },
      { id: 'orange', embedding: embeddings.orange },
      { id: 'pineapple', embedding: embeddings.pineapple },
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

  test('can fetch embedding only entries with embeddings', async () => {
    const embeddings = getTestEmbeddings()
    const coll = await getTestCollection()

    const insertItems = [
      { id: 'book', embedding: embeddings.book },
      { id: 'orange', embedding: embeddings.orange },
      { id: 'pineapple', embedding: embeddings.pineapple },
    ]

    await coll.insert(insertItems)

    const libraryResponse = await coll.findBy({ embeddings: [embeddings.library] })
    expect(libraryResponse[0].matches.length).toBe(2)
    expect(libraryResponse[0].matches[0].id).toBe('book')

    const hawaiiResponse = await coll.findBy({ embeddings: [embeddings.hawaii] })
    expect(hawaiiResponse[0].matches.length).toBe(2)
    expect(hawaiiResponse[0].matches[0].id).toBe('pineapple')

    const floridaResponse = await coll.findBy({ embeddings: [embeddings.florida] })
    expect(floridaResponse[0].matches.length).toBe(2)
    expect(floridaResponse[0].matches[0].id).toBe('orange')

  })
})
