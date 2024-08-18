const { ChromaClient } = require("chromadb")
const { Brain } = require('./brain.js')

const brain = new Brain()
const client = new ChromaClient()

const Chroma = {
  Collection,
  Embedder,
}
module.exports = Chroma


function Collection(collection) {
  this.coll = collection
}

Collection.prototype.findBy = async function(opts) {
  let result

  if (opts.texts) {
    result = await this.coll.query({
      nResults: opts.limit || 2,
      queryTexts: opts.texts,
    })
  }
  else if (opts.embeddings) {
    result = await this.coll.query({
      nResults: opts.limit || 2,
      queryEmbeddings: opts.embeddings
    })
  }
  else {
    throw new Error('nothing to find with')
  }


  if (result.error) {
    throw new Error(result.error)
  }

  const output = []
  for (let i = 0; i < result.ids.length; i++) {
    const m = {
      // query: opts.texts[i],
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

Collection.prototype.insert = async function(items) {
  if (items.length === 0) {
    throw new Error('Empty items list')
  }

  const count = items.length
  const insertData = {}

  insertData.ids = items
    .map(x => x.id)
    .filter(x => Boolean(x))
  if (insertData.ids.length != count) {
    throw new Error('Insufficient or invalid ids: ' + insertData.ids)
  }

  if (items[0].document) {
    insertData.documents = items
      .map(x => x.document.trim())
      .filter(x => Boolean(x))
    if (insertData.documents.length != count) {
      throw new Error('Insufficient or invalid documents')
    }
  }

  if (items[0].embedding) {
    insertData.embeddings = items.map(x => x.embedding)
  }

  if (!insertData.documents && !insertData.embeddings) {
    throw new Error('At least one of `document` and `embedding` must be provided.')
  }

  if (items[0].metadata) {
    insertData.metadatas = items.map(x => x.metadata)
  }

  await this.coll.add(insertData)
}


////////////////////////////////////////////////////////////////////////////////
// Local classes and functions

function Embedder() {}
Embedder.prototype.generate = brain.embed
