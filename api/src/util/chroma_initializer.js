// Use this script to initialize your database for launching a new instance of the website.

const { ChromaClient } = require("chromadb")
const Embedder = require('./chroma_embedder.js')
const client = new ChromaClient()

client.createCollection({
  name: 'thread',
  embedding: new Embedder(),
})
