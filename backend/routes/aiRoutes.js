const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:', {
  hasApiKey: !!process.env.GEMINI_API_KEY,
  apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  apiKeyStart: process.env.GEMINI_API_KEY?.substring(0, 4) || 'none'
});

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: Gemini API key is not configured in environment variables');
  console.error('Current working directory:', process.cwd());
  console.error('Environment variables:', process.env);
}

// Initialize Gemini API with your API key
const genAI = new GoogleGenerativeAI(apiKey);

// System instructions to define the assistant's behavior and knowledge focus
const systemInstructions = `
You are a sustainability expert and carbon footprint advisor with deep knowledge in environmental science, renewable energy, and sustainable living practices. Your responses MUST follow these guidelines:

1. PERSONALIZATION:
   - Always address the user by name if available
   - Reference their specific carbon footprint data when relevant
   - Consider their transportation and energy usage patterns
   - Adapt advice based on their lifestyle and habits

2. RESPONSE STRUCTURE:
   - Start with a brief, friendly greeting (1 line)
   - Present 3-4 key points in this format:
     • Point 1: [2-3 sentences with specific, actionable advice]
     • Point 2: [2-3 sentences with specific, actionable advice]
     • Point 3: [2-3 sentences with specific, actionable advice]
     • Point 4: [2-3 sentences with specific, actionable advice] (optional)

3. CONTENT GUIDELINES:
   - Use bullet points (•) for every point
   - Keep each point under 2-3 sentences
   - Start each point with a clear action or topic
   - Focus on specific, actionable advice
   - Prioritize the most impactful changes first
   - Include both immediate and long-term solutions
   - Provide concrete examples and numbers when possible
   - Consider local context and available resources
   - Mention potential cost savings or benefits
   - Include relevant statistics or research findings

4. TONE AND STYLE:
   - Be encouraging and positive
   - Use clear, accessible language
   - Avoid technical jargon unless necessary
   - Show empathy and understanding
   - End with a brief, motivating note (1 line)

5. KNOWLEDGE AREAS:
   - Energy efficiency and conservation
   - Sustainable transportation
   - Waste reduction and recycling
   - Sustainable food choices
   - Water conservation
   - Green building and home improvements
   - Renewable energy options
   - Carbon offset programs
   - Sustainable shopping habits
   - Community engagement

Example format:
Hi [name]! Based on your carbon footprint of [X] kg CO2, here are your personalized sustainability tips:

• Energy Savings: [specific tip based on user's energy data]
• Transportation: [specific tip based on user's transport data]
• Daily Habits: [specific actionable tip]
• Long-term Impact: [specific long-term solution]

Keep up the great work on your sustainability journey! Every small change makes a difference.
`;

// Get a model ready for prompting
const getGeminiResponse = async (userPrompt, userContext) => {
  try {
    console.log('Initializing Gemini with API key:', apiKey ? 'API key exists' : 'API key missing');
    
    // Basic error handling for API key
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    
    // Use gemini-2.0-flash model instead of gemini-1.0-pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create a contextual prompt that includes user data
    const contextualPrompt = `
      ${systemInstructions}
      
      User Context:
      • Footprint: ${userContext.footprint || 'Unknown'} kg CO2
      • Name: ${userContext.username || 'User'}
      • Transport: ${userContext.transportData ? JSON.stringify(userContext.transportData) : 'No data'}
      • Energy: ${userContext.energyData ? JSON.stringify(userContext.energyData) : 'No data'}
      
      Question: ${userPrompt}
      
      Provide your response in the exact format specified above, with:
      1. A brief greeting
      2. 3-4 bullet points with specific, actionable advice
      3. A brief encouraging note
      
      Keep each point focused and under 2-3 sentences.
    `;
    
    console.log('Sending prompt to Gemini with model: gemini-2.0-flash');
    
    // Generate content using the basic generateContent method
    const result = await model.generateContent(contextualPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Received response from Gemini');
    
    return {
      text,
      sender: 'assistant',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    console.error('Error details:', error.message);
    if (error.message && error.message.includes('API key')) {
      throw new Error('Invalid API key configuration');
    }
    throw error;
  }
};

// Create an AI chat session
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    const response = await getGeminiResponse(message, context || {});
    
    // Save to chat history
    // This would connect to your database in a real implementation
    
    return res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get AI response'
    });
  }
});

// Get chat history for the current user
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // This would fetch chat history from your database in a real implementation
    // For now, we'll return an empty array
    
    return res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

// Save chat session
router.post('/save-session', auth, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user.id;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Valid messages array is required'
      });
    }
    
    // This would save the messages to your database in a real implementation
    console.log(`Saving ${messages.length} messages for user ${userId}`);
    
    return res.json({
      success: true,
      message: 'Chat session saved successfully'
    });
  } catch (error) {
    console.error('Error saving chat session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save chat session'
    });
  }
});

// Simple endpoint to test authentication
router.get('/auth-test', auth, (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: req.user.id || req.user._id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Error in auth test:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 