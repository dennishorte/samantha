const OpenAI = require("openai")
const openai = new OpenAI()


module.exports = {
  ChromaEmbedder,
}

function ChromaEmbedder() {}

ChromaEmbedder.prototype.generate = async function(texts) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
    encoding_format: "float",
  })

  return embedding.data.map(datum => datum.embedding)
}
