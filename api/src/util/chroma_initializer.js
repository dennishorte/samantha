// Use this script to initialize your database for launching a new instance of the website.

import { ChromaClient } from "chromadb"
import Embedder from './chroma_embedder.js'
const client = new ChromaClient()

client.createCollection({
  name: 'thread',
  embedding: new Embedder(),
})
