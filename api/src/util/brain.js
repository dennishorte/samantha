import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"
import OpenAI from 'openai'


const Brain = {}
export default Brain


Brain.embed = async function(texts) {
  const embedding = await Brain._embed(texts)
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
  const messages = [
    {"role": "system", "content": "You are an effecient program manager and personal assistant."},
    ...context
  ]
  const completion = await Brain._complete(messages, format)
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

  const messages = [
    {
      "role": "system",
      "content": summarySystemMessage,
    },
    ...context
  ]

  const completion = await Brain._complete(messages, zodResponseFormat(SummarizationResponse, 'summary'))

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
      content: 'Create a JSON array containing topics discussed during the whole backlog of our conversation. The topics should be high level, so that if we talked about many small parts of one larger project, only include the high level project.'
    },
  ]

  const result = await Brain.complete(messages, zodResponseFormat(topicsFormat, 'topics'))
  const topics = JSON.parse(result.message.content)

  return topics
}

Brain.groupByTopics = async function(thread, topics) {
  topics.push('other')
  topics = topics
    .map(x => x.trim())
    .filter(x => x.length > 0)

  const topicsString = topics.join('\n')

  const groups = {}
  const __addToGroups = (topic, exchange) => {
    if (topic in groups) {
      exchange.forEach(x => groups[topic].push(x))
    }
    else {
      groups[topic] = [...exchange]
    }
  }

  const exchanges = _exchanges(thread.getMessages())
  for (const x of exchanges) {
    const exchangeString = x
      .map(e => `**${e.role}**\n${e.content}`)
      .join('\n\n')

    const context = [
      ...x,
      {
        role: 'user',
        content: `Here is a list of valid topics.
${topicsString}

Which topic or topics does the following exchange best fit?
${exchangeString}

Your answer should be just a topic from the list, without any special formatting.
        `,
      },
    ]

    const response = await Brain.complete(context)
    const topic = response.message.content
    __addToGroups(topic, x)
  }

  return groups
}

function _exchanges(messages) {
  const output = []
  let exchange = []
  for (const m of messages) {
    if (m.role === 'user') {
      output.push(exchange)
      exchange = [m]
    }
    else {
      exchange.push(m)
    }
  }

  output.shift()
  return output
}

////////////////////////////////////////////////////////////////////////////////
// Internal LLM interface

let openai
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI()
}


Brain._embed = async function(texts) {
  if (!openai) {
    throw new Error('OpenAI client not initialized')
  }

  const request = {
    model: "text-embedding-3-small",
    input: texts,
    encoding_format: "float",
  }

  return await openai.embeddings.create(request)
}

Brain._complete = async function(messages, format=null) {
  if (!openai) {
    throw new Error('OpenAI client not initialized')
  }

  const request = {
    messages,
    model: "gpt-4o-mini",
  }

  if (format) {
    request.response_format = format
  }

  return await openai.chat.completions.create(request)
}
