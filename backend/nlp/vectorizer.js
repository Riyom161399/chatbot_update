// vectorizer.js
import natural from "natural";
import { preprocess } from "./preprocess.js";

const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

/**
 * Train TF-IDF using example sentences
 */
export function trainVectorizer(intents) {
  intents.forEach((intent) => {
    intent.examples.forEach((sentence) => {
      tfidf.addDocument(preprocess(sentence));
    });
  });
}

/**
 * Convert sentence into TF-IDF vector
 */
export function vectorize(sentence) {
  const vector = [];
  tfidf.tfidfs(preprocess(sentence), (i, measure) => {
    vector.push(measure);
  });
  return vector;
}

/**
 * Cosine similarity (NEW)
 */
export function cosineSimilarity(vecA, vecB) {
  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
