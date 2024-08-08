import tiktoken


class Tokenizer(object):
    def __init__(self, *, model):
        self.model = model
        self.encoding = tiktoken.encoding_for_model(model)

    def tokenize(self, text):
        return self.encoding.encode(text)
