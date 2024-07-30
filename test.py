from openai import OpenAI
import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

MODEL = "gpt-4o-mini"
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

completion = client.chat.completions.create(
  model=MODEL,
  messages=[
    {
        "role": "system",
        "content": "You are a helpful assistant. Help me with my math homework!"
    },
    {
        "role": "user",
        "content": "Hello! Could you solve 2+2?"
    },
  ]
)

print("Assistant: " + completion.choices[0].message.content)

print(completion)
