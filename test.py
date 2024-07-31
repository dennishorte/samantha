import os

from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

from embeddings import Embeddings
from session import Session


# Load the .env file
load_dotenv()


def load_system_file(filename):
    filepath = os.path.join('sys', filename + '.txt')
    with open(filepath, 'r', encoding='utf-8') as fin:
        content = fin.read()
    return content


def load_system_context():
    return load_system_file('system_context')


def test_session():
    session = Session(
        client=OpenAI(api_key=os.environ.get("OPENAI_API_KEY")),
        model="gpt-4o-mini",
        system_prompt=load_system_context()
    )

    while True:
        user_input = input('you: ')
        response = session.send_message(user_input)
        print("\n")
        print(response)
        print("\n\n")


def test_embeddings():
    embeddings = Embeddings(
        client=OpenAI(api_key=os.environ.get("OPENAI_API_KEY")),
        model='text-embedding-3-small',
    )

    print(embeddings.generate('hello'))


if __name__ == "__main__":
    test_embeddings()
