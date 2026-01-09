from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')

class EmbeddingRequest(BaseModel):
    inputs: str

@app.post("/v1/embeddings")
def get_embeddings(request: EmbeddingRequest):
    embedding = model.encode(request.inputs)
    return embedding.tolist()
