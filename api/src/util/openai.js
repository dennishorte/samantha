import OpenAI from 'openai'

let client

if (process.env.OPENAI_API_KEY) {
  client = new OpenAI()
}

export default {
  embed,
  complete
}


async function embed(texts) {
  if (!client) {
    throw new Error('OpenAI client not initialized')
  }

  const request = {
    model: "text-embedding-3-small",
    input: texts,
    encoding_format: "float",
  }

  return await client.embeddings.create(request)
}

async function complete(messages, format=null) {
  if (!client) {
    throw new Error('OpenAI client not initialized')
  }

  const request = {
    messages,
    model: "gpt-4o-mini",
  }

  if (format) {
    request.response_format = format
  }

  return await client.chat.completions.create(request)
}
