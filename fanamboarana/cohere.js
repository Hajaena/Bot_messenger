const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });

async function generateWithCohere(tany_fanoratana) {
  const response = await cohere.generate({
    model: 'command-r-plus',
    prompt: tany_fanoratana,
    max_tokens: 250,
    temperature: 0.7,
  });

  return response.generations[0].text;
}

module.exports = { generateWithCohere }
