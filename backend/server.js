require('dotenv').config();
const app = require('./app');
const http = require('http');
const port = process.env.PORT || 5000;

// Debug environment variables
console.log('Server starting with environment:', {
  port,
  hasApiKey: !!process.env.GEMINI_API_KEY,
  apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  apiKeyStart: process.env.GEMINI_API_KEY?.substring(0, 4) || 'none'
});

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});