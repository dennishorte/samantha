import os

from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI


# Load the .env file
load_dotenv()


def load_system_file(filename):
    filepath = os.path.join('sys', filename + '.txt')
    with open(filepath, 'r', encoding='utf-8') as fin:
        content = fin.read()
    return content


def load_history():
    return load_system_file('history')


def load_system_context():
    return load_system_file('system_context')


def write_to_history(user_message, completion):
    filename = os.path.join('sys', 'history.txt')
    with open(filename, 'a', encoding='utf-8') as fout:
        fout.write('\n\n' + str(completion.created))
        fout.write('\n\nUser Message\n')
        fout.write(user_message)
        fout.write('\n\nReply\n')
        fout.write(completion.choices[0].message.content)


def send_message(history, message):
    user_message = history + '\n\n' + str(datetime.now().timestamp()) + '\n\nLatest User Message\n' + message

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": system_context,
            },
            {
                "role": "user",
                "content": user_message,
            },
        ]
    )

    write_to_history(message, completion)

    print("\n\n")
    print(completion.choices[0].message.content)
    print("\n\n")


if __name__ == "__main__":
    MODEL = "gpt-4o-mini"
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    system_context = load_system_context()
    history = load_history()

    message = """I don't have a calendar yet. Can you create one for me?"""

    send_message(history, message)
