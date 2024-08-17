const OpenAI = require("openai")
const openai = new OpenAI()


module.exports = {
  complete,
  embed,
  summarize,

  _callCompletionsCreateEndpoint,
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


const summarySystemMessage = `Please provide a summary of everything in this conversation. The summary should include all of the major topics and subthemes, and should be at most 500 words long. Also include a list of all of the proper nouns. Please provide the summary in JSON format. Do not wrap the JSON in a code block; reply in plain JSON. An example of a well formatted answer is the following.
{
  summary: "This is a summary of this conversation.",
  keywords: ['Dennis', 'Samantha']
}
`

async function summarize(context) {
  if (!context || !context.length) {
    throw new Error('empty context')
  }

  messages = [
    {
      "role": "system",
      "content": summarySystemMessage,
    },
    ...context
  ]

  const completion = await _callCompletionsCreateEndpoint({
    messages,
    model: "gpt-4o-mini",
  })

  return JSON.parse(completion.choices[0])
}

async function _callCompletionsCreateEndpoint(payload) {
  return await openai.chat.completions.create(payload)
}
