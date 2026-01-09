import { createRequire } from "module";
const require = createRequire(import.meta.url);
const intentsData = require("../nlp/intents.json");

import { initNLP, classifyIntent } from "../nlp/intentClassifier.js";

await initNLP(intentsData.intents); // RUNS ONCE

export const Message = async (req, res) => {
  const { text } = req.body;

  const result = await classifyIntent(text);

  res.json({
    botMessage: result.response,
    intent: result.intent,
    confidence: result.confidence,
  });
};
