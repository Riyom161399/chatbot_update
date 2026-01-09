// embeddings.js
export async function getEmbedding(text) {
  const res = await fetch("http://localhost:7860/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: text }),
  });

  const data = await res.json();
  // The Python service returns the array directly
  return data;
}
