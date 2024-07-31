from openai import OpenAI


class Session:
    def __init__(self, *, client, model, system_prompt):
        self.client = client
        self.model = model

        self.messages = [{
            "role": "system",
            "content": system_prompt,
        }]

    def send_message(self, user_message):
        self.messages.append({ "role": "user", "content": user_message })
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.messages
        )
        assistant_message = response.choices[0].message.content
        self.messages.append({
            "role": "assistant",
            "content": assistant_message,
        })
        return assistant_message
