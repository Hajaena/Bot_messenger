const { GoogleGenerativeAI } = require('@google/generative-ai')

if (!process.env.GOOGLE_API_KEY) {
    console.error('lakile any ny google generative ai tsy hita')
    process.exit(1)
}

const geminiAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
async function mamokatra_miaraka_gemini(tany_fanoratana) {
    const model = geminiAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(tany_fanoratana);
    const response = await result.response;

    return response.text();
}

module.exports = { mamokatra_miaraka_gemini }