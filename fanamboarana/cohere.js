const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });

async function generateWithCohere(tany_fanoratana) {
  try {
    const response = await cohere.chat({
      model: 'command-r-08-2024',
      message: tany_fanoratana,
      temperature: 0.7,
      max_tokens: 250,
    });

    return response.text;
  } catch (error) {
    console.error('Erreur génération:', error);
    throw error;
  }
}

module.exports = { generateWithCohere };
