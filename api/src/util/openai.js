const OpenAI = require("openai")
const openai = new OpenAI()


module.exports = {
  complete,
  embed,
}

async function embed(texts) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
    encoding_format: "float",
  })

  return embedding.data.map(datum => datum.embedding)
}

/*
   Context is an array of messages with the following format:
   {
     role: String        <'system', 'user', 'assistant'>
     content: String
   }

   A sample response might look like:
   {
     index: 0,
     message: {
       role: 'assistant',
       content: 'Hello! How can I assist you today?',
       refusal: null
     },
     logprobs: null,
     finish_reason: 'stop'
   }
 */
async function complete(context) {
  messages = [
    {"role": "system", "content": "You are an effecient program manager and personal assistant."},
    ...context
  ]

  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-4o-mini",
  })

  return completion.choices[0]
}
