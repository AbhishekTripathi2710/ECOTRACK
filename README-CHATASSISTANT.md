# Sustainability Chat Assistant

This feature adds an AI-powered chat assistant to the carbon footprint application, providing personalized sustainability advice, tips, and information using Google's Gemini AI.

## Features

- **AI Chat Interface**: Floating chat button available throughout the application
- **Personalized Responses**: Uses your carbon footprint data to provide tailored advice
- **Suggested Questions**: Quick-start questions for common sustainability topics
- **Chat History**: Saves your conversations for future reference
- **Responsive Design**: Works well on both mobile and desktop

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Save the API key for the next step

### 2. Configure the Backend

1. Create or modify the `.env` file in the `backend` directory
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### 3. Install Dependencies

The feature requires the Google Generative AI SDK for Node.js. Run:

```bash
cd backend
npm install @google/generative-ai
```

### 4. Start the Application

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Using the Chat Assistant

1. **Access**: Click the chat button in the bottom-right corner of any page
2. **Start a Conversation**: Type your question or select a suggested question
3. **View Personalized Advice**: Receive sustainability advice tailored to your carbon footprint
4. **Ask Follow-up Questions**: Continue the conversation to explore specific topics in depth

## Examples of Questions

- "How can I reduce my carbon footprint based on my data?"
- "What are easy ways to save energy at home?"
- "Is my carbon footprint above or below average?"
- "How can I eat more sustainably?"
- "What's the environmental impact of driving vs. public transport?"

## Technical Implementation

- **Frontend**: React with Material-UI components for the chat interface
- **Backend**: Express.js API endpoints to handle AI requests
- **AI Integration**: Google's Gemini API for generating responses
- **Data Integration**: Uses your carbon footprint data for personalized advice

## Troubleshooting

- **Assistant not appearing**: Make sure you're logged in
- **No response from AI**: Check your internet connection and verify the API key is correctly set
- **Generic responses**: Ensure your carbon footprint data is up to date for more personalized advice 