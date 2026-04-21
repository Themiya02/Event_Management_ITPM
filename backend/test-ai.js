const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log('Using Key:', key);
    if (!key) {
      console.error('No API Key found in .env');
      return;
    }
    const genAI = new GoogleGenerativeAI(key);
    
    // List models
    // Since the SDK might not have a direct listModels on genAI, we can try to use the REST API logic or check if it exists
    console.log('Attempting to check models...');
    // The current SDK might not easily list models. Let's try a common model like 'gemini-1.0-pro'
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = 'Success?';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Response:', response.text());
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

testGemini();
