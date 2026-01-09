import { getEmbedding } from "./embeddings.js";

let trainedIntents = [];

/**
 * STEP 2A: Train once when server starts
 */
export async function initNLP(intents) {
  trainedIntents = [];

  for (const intent of intents) {
    const vectors = [];

    // 1️⃣ generate embeddings for examples
    for (const example of intent.examples) {
      const vec = await getEmbedding(example);
      vectors.push(vec);
    }

    // 2️⃣ average vectors
    const avgVector = vectors[0].map(
      (_, i) => vectors.reduce((sum, v) => sum + v[i], 0) / vectors.length
    );

    trainedIntents.push({
      intent: intent.intent,
      response: intent.response,
      vector: avgVector,
    });
  }

  console.log("✅ NLP training complete");
}

/**
 * STEP 2B: Compare user input with trained intents
 */
export async function classifyIntent(text) {
  const inputVector = await getEmbedding(text);

  let bestScore = 0;
  let bestMatch = null;

  for (const item of trainedIntents) {
    const score = cosineSimilarity(inputVector, item.vector);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestScore < 0.6) {
    return {
      intent: null,
      response: "I'm not sure about that 🤔",
      confidence: bestScore,
    };
  }

  return {
    intent: bestMatch.intent,
    response: bestMatch.response,
    confidence: bestScore,
  };
}

/**
 * Cosine similarity
 */
function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
