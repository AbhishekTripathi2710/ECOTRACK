import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Avatar, 
  Chip,
  CircularProgress,
  Fab,
  Drawer,
  Divider,
  InputAdornment,
  Fade,
  Slide,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Send as SendIcon,
  Close as CloseIcon,
  QuestionAnswer as AssistantIcon,
  Person as PersonIcon,
  Nature as NatureIcon,
  ArrowUpward as ScrollTopIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import { sendMessageToGemini, getChatHistory, saveChatSession, testAuthentication } from '../services/aiService';
import { logAuthInfo, checkAuthToken } from '../utils/authDebug';
import { useNavigate } from 'react-router-dom';

// Sample initial messages that will be shown when the chat starts
const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    text: 'Hello! I\'m your sustainability assistant powered by Google\'s Gemini AI. I can answer questions about reducing your carbon footprint and living more sustainably.',
    sender: 'assistant',
    timestamp: new Date()
  },
  {
    id: 'welcome-2',
    text: 'How can I help you today? You can ask me about eco-friendly practices, your carbon footprint, or ways to make sustainable choices.',
    sender: 'assistant',
    timestamp: new Date(Date.now() + 100)
  }
];

// Sample suggested questions that users can click on to ask
const SUGGESTED_QUESTIONS = [
  "How can I reduce my carbon footprint?",
  "What are the best sustainable food choices?",
  "How can I save energy at home?",
  "What's the environmental impact of flying?",
  "Are electric cars truly better for the environment?"
];

const SustainabilityAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useUser();
  const { currentFootprint } = useCarbonFootprint();
  const navigate = useNavigate();
  const theme = useTheme();

  // Add debug logging for authentication
  useEffect(() => {
    console.log('SustainabilityAssistant - User state:', user);
    logAuthInfo();
    
    // Check if token is valid and log detailed information
    const tokenStatus = checkAuthToken();
    console.log('Token validity check:', tokenStatus);
    
    if (user && localStorage.getItem('authToken')) {
      // Test authentication with backend
      testAuthentication()
        .then(result => {
          console.log('Authentication test result:', result);
          if (!result.success) {
            console.warn('Backend authentication failed - token may be invalid or expired');
          }
        })
        .catch(err => console.error('Authentication test error:', err));
    }
    
    if (!tokenStatus.valid && localStorage.getItem('authToken')) {
      console.warn('Invalid token detected. Consider clearing localStorage and logging in again.');
    }
  }, [user]);

  // Fetch chat history when component mounts and user is available
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        if (error.response?.status === 401) {
          // Handle unauthorized error
          navigate('/login');
        } else {
          // Handle other errors
          setMessages([
            {
              id: 'auth-required',
              text: 'Failed to load chat history. Please try again later.',
              sender: 'assistant',
              timestamp: new Date()
            }
          ]);
        }
      }
    };

    fetchChatHistory();
  }, [navigate]);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  // Save chat session when user closes the chat or component unmounts
  useEffect(() => {
    return () => {
      if (messages.length > INITIAL_MESSAGES.length && user) {
        saveChatSession(messages).catch(err => 
          console.error('Failed to save chat session:', err)
        );
      }
    };
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Get the response from the assistant
      const assistantMessage = await sendMessageToGemini(userMessage.text, {
        username: user?.name || 'Guest',
        footprint: currentFootprint?.total || null,
        transportData: currentFootprint?.transportation || {},
        energyData: currentFootprint?.energy || {}
      });
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Save chat after each successful exchange
      if (user) {
        saveChatSession([...messages, userMessage, assistantMessage]).catch(err => 
          console.error('Failed to save chat session:', err)
        );
      }
    } catch (error) {
      console.error('Error getting response from assistant:', error);
      
      // Add specific error message
      let errorMessage = 'Sorry, I encountered an error. Please try again later.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to continue the conversation. You can still view the initial messages and suggested questions.';
      } else if (error.response?.status === 500) {
        // Check if this is an API key error
        if (error.response?.data?.error === 'Failed to get AI response') {
          errorMessage = 'The AI service is currently unavailable due to a configuration issue. Please contact the administrator to check the Gemini API key configuration.';
        }
      }
      
      setMessages(prevMessages => [...prevMessages, {
        id: `error-${Date.now()}`,
        text: errorMessage,
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setNewMessage(question);
  };

  const toggleDrawer = () => {
    setOpen(prevOpen => !prevOpen);
    
    // When closing, save the chat session
    if (open && messages.length > INITIAL_MESSAGES.length && user) {
      saveChatSession(messages).catch(err => 
        console.error('Failed to save chat session:', err)
      );
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToTop = () => {
    scrollToBottom();
    setShowScrollTop(false);
  };

  return (
    <>
      {/* Floating action button to open the chat */}
      <Fade in={!open} timeout={300}>
        <Fab 
          color="primary" 
          aria-label="chat assistant"
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            background: theme.palette.primary.main,
            '&:hover': {
              background: theme.palette.primary.dark,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AssistantIcon />
        </Fab>
      </Fade>

      {/* Chat drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            background: theme.palette.background.default,
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          background: theme.palette.background.default
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: alpha(theme.palette.primary.main, 0.05)
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssistantIcon color="primary" />
              <Typography variant="h6">Sustainability Assistant</Typography>
            </Box>
            <IconButton onClick={toggleDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages area */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {messages.map((message, index) => (
              <Slide 
                direction="up" 
                in={true} 
                timeout={300} 
                key={message.id}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    gap: 1,
                    maxWidth: '85%',
                    ml: message.sender === 'user' ? 'auto' : 0,
                    mr: message.sender === 'user' ? 0 : 'auto'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: message.sender === 'user' 
                        ? theme.palette.primary.main 
                        : theme.palette.secondary.main,
                      width: 32,
                      height: 32
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon /> : <NatureIcon />}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: message.sender === 'user'
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.secondary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        [message.sender === 'user' ? 'right' : 'left']: -8,
                        transform: 'translateY(-50%)',
                        border: `8px solid transparent`,
                        borderRightColor: message.sender === 'user'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : 'transparent',
                        borderLeftColor: message.sender === 'user'
                          ? 'transparent'
                          : alpha(theme.palette.secondary.main, 0.1),
                      }
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        color: message.isError ? theme.palette.error.main : 'inherit'
                      }}
                    >
                      {message.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        opacity: 0.7,
                        textAlign: message.sender === 'user' ? 'right' : 'left'
                      }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </Paper>
                </Box>
              </Slide>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Suggested questions */}
          {messages.length <= INITIAL_MESSAGES.length && (
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Suggested Questions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => handleSuggestedQuestion(question)}
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Input area */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={isLoading || !newMessage.trim()}
                      color="primary"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Drawer>

      {/* Scroll to top button */}
      <Fade in={showScrollTop} timeout={300}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            background: theme.palette.primary.main,
            '&:hover': {
              background: theme.palette.primary.dark,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ScrollTopIcon />
        </Fab>
      </Fade>
    </>
  );
};

export default SustainabilityAssistant; 