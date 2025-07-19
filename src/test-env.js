// Test environment variables
console.log('Testing environment variables...');
console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('API Key length:', import.meta.env.VITE_OPENAI_API_KEY ? import.meta.env.VITE_OPENAI_API_KEY.length : 0);
console.log('API Key preview:', import.meta.env.VITE_OPENAI_API_KEY ? import.meta.env.VITE_OPENAI_API_KEY.substring(0, 20) + '...' : 'N/A'); 