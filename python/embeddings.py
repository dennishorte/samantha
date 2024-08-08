class Embeddings(object):
    def __init__(self, *, client, model):
        self.client = client
        self.model = model

    def generate(self, text):
        return self.client.embeddings.create(input=text, model=self.model).data[0].embedding
