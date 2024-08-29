const OpenAI = require("openai")
const { zodResponseFormat } = require("openai/helpers/zod")
const { z } = require("zod")

const openai = new OpenAI()


const Brain = {}
module.exports = Brain


Brain.embed = async function(texts) {
  const embedding = await Brain._getEmbedding({
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
Brain.complete = async function(context, format=null) {
  messages = [
    {"role": "system", "content": "You are an effecient program manager and personal assistant."},
    ...context
  ]

  const request = {
    messages,
    model: "gpt-4o-mini",
  }

  if (format) {
    request.response_format = format
  }

  const completion = await Brain._getChatCompletion(request)

  return completion.choices[0]
}


const summarySystemMessage = `Please provide a summary of everything in this conversation. The summary should include all of the major topics and subthemes, and should be at most 500 words long. Also include a list of all of the proper nouns. Please provide the summary in JSON format. Do not wrap the JSON in a code block; reply in plain JSON. An example of a well formatted answer is the following.
{
  summary: "This is a summary of this conversation.",
  keywords: ['Dennis', 'Samantha']
}
`

const SummarizationResponse = z.object({
  keywords: z.array(z.string()),
  summary: z.string(),
})

Brain.summarize = async function(context) {
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

  const completion = await Brain._getChatCompletion({
    messages,
    model: "gpt-4o-mini",
    response_format: zodResponseFormat(SummarizationResponse, 'summary'),
  })

  let result
  try {
    result = JSON.parse(completion.choices[0].message.content)
  }
  catch (e) {
    throw e
  }

  if (
    !result.summary
    || !(typeof result.summary === 'string')
    || !result.keywords
    || !Array.isArray(result.keywords)
  ) {
    throw new Error('Invalid response format for summary')
  }

  result.keywords = result.keywords.map(x => x.toLowerCase())

  return result
}

const topicsFormat = z.object({
  topics: z.array(z.string()),
})

Brain.topics = async function(thread) {
  const messages = [
    ...thread.getMessages(),
    {
      role: 'user',
      content: 'Create a JSON array containing high-level topics discussed in the preceding conversation.'
    },
  ]

  const result = await Brain.complete(messages, zodResponseFormat(topicsFormat, 'topics'))
  const topics = JSON.parse(result.message.content)

  return topics
}

Brain._getEmbedding = async function(body) {
  return await openai.embeddings.create(body)
}

Brain._getChatCompletion = async function(body) {
  return await openai.chat.completions.create(body)
}
