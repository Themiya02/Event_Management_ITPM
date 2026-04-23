require('dotenv').config();

async function listModels() {
  try {
    const key = process.env.GEMINI_API_KEY.trim();
    console.log('Using Key:', key);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      return;
    }
    
    console.log('Available Models:');
    if (data.models) {
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log('No models found in the response.');
      console.log('Response content:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('List Failed:', err.message);
  }
}

listModels();
