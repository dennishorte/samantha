require('dotenv').config()

const OpenAI = require("openai")
const openai = new OpenAI()


module.exports = {}

module.exports.getEmbeddings = async function(texts) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
    encoding_format: "float",
  })

  return embedding.data[0].embedding
}
