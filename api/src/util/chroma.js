const { ChromaClient } = require("chromadb")
const openai = require('./openai.js')

const client = new ChromaClient()


module.exports = {
  test
}


async function test() {
  await client.deleteCollection({ name: 'test_collection' })

  await client.createCollection({
    name: "test_collection",
    embeddingFunction: new openai.ChromaEmbedder(),
  })

  const collection = await client.getCollection({
    name: "test_collection",
    embeddingFunction: new openai.ChromaEmbedder(),
  })

  await collection.add({
    ids: ["id1", "id2", "id3"],
    metadatas: [
      {"chapter": "3", "verse": "16"},
      {"chapter": "3", "verse": "5"},
      {"chapter": "29", "verse": "11"}
    ],
    documents: [
      'This is an orange',
      'This is a pineapple',
      'This is a book',
    ],
  })

  const result = await collection.query({
    nResults: 2, // n_results
    queryTexts: ["library"], // query_text
  })

  console.log(result)
}
