import os

from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

from embeddings import Embeddings
from tokenizer import Tokenizer
from session import Session


# Load the .env file
load_dotenv()

GPT_MODEL = 'gpt-4o-mini'


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
        model=GPT_MODEL,
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


def test_tokenizer():
    tokenizer = Tokenizer(model=GPT_MODEL)
    print(tokenizer.tokenize('This is a short text'))

    long_text = """ Does Cream Cheese Frosting Need to Be Refrigerated?

Yes, cream cheese frosting should never sit at room temperature for more than a few hours at a time. Store the frosting in an airtight container in the refrigerator for up to three days.

To store a cake frosted with cream cheese cheese frosting, chill the uncovered cake in the fridge for at least 15 minutes so that the frosting hardens slightly. Cover with plastic wrap in the fridge for up to three days. """

    long_tokens = tokenizer.tokenize(long_text)
    print(len(long_text.split()), len(long_tokens))


if __name__ == "__main__":
    test_tokenizer()
