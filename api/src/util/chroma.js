const { ChromaClient } = require("chromadb")
const openai = require('./openai.js')

const client = new ChromaClient()

const Chroma = {}
module.exports = Chroma


Chroma.initializeTestCollection = async function() {
  await client.deleteCollection({ name: 'test_collection' })

  await client.createCollection({
    name: "test_collection",
    embeddingFunction: new OpenAiEmbedder(),
  })

  const collection = await client.getCollection({
    name: "test_collection",
    embeddingFunction: new OpenAiEmbedder(),
  })

  return new Collection(collection)
}


function Collection(collection) {
  this.coll = collection
}

Collection.prototype.findBy = async function(opts) {
  if (opts.texts) {
    const result = await this.coll.query({
      nResults: opts.limit || 2,
      queryTexts: opts.texts,
    })

    const output = []
    for (let i = 0; i < opts.texts.length; i++) {
      const m = {
        query: opts.texts[i],
        matches: []
      }

      for (let n = 0; n < result.ids[i].length; n++) {
        const item = {}
        item.id = result.ids[i][n]
        item.text = result.documents[i][n]
        item.distance = result.distances[i][n]
        m.matches.push(item)
      }

      output.push(m)
    }

    return output
  }
  else {
    throw new Error('nothing to find with')
  }
}

Collection.prototype.insert = async function(items) {
  const ids = items.map(x => x.id)
  const documents = items.map(x => x.document)
  await this.coll.add({ ids, documents })
}


////////////////////////////////////////////////////////////////////////////////
// Local classes and functions

function OpenAiEmbedder() {}
OpenAiEmbedder.prototype.generate = openai.embed
