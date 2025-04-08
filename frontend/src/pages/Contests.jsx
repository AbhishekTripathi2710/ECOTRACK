import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  LinearProgress, 
  Chip, 
  Divider,
  Alert,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  getAllChallenges, 
  getUserChallenges, 
  joinChallenge, 
  getUserAchievements 
} from '../services/communityService';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import Navbar from '../components/navbar';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 10,
        },
      },
    },
  },
});

const Contests = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loginDialog, setLoginDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all challenges
      const challengesResponse = await getAllChallenges();
      if (challengesResponse) {
        setChallenges(challengesResponse);
        
        // If user is logged in, fetch their challenges and achievements
        if (user?._id) {
          try {
            // Fetch user's joined challenges
            const userChallengesResponse = await getUserChallenges(user._id);
            if (userChallengesResponse) {
              setUserChallenges(userChallengesResponse);
            }
            
            // Fetch user's achievements
            const achievementsResponse = await getUserAchievements(user._id);
            if (achievementsResponse) {
              setUserAchievements(achievementsResponse);
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            // Don't set error here, just log it
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load challenges. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (!user?._id) {
      setLoginDialog(true);
      return;
    }
    
    try {
      console.log('User joining challenge:', user._id, 'Challenge ID:', challengeId);
      const response = await joinChallenge(user._id, challengeId);
      
      if (response.success) {
        // Refresh data
        fetchData();
        setSuccess('Successfully joined the challenge!');
      } else {
        setError(response.error || 'Failed to join challenge');
      }
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError('Failed to join challenge. Please try again later.');
    }
  };

  const handleLoginRedirect = () => {
    setLoginDialog(false);
    navigate('/login');
  };

  const calculateProgress = (challenge) => {
    // Find if user has joined this challenge
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challenge.id);
    
    if (!userChallenge) return 0;
    
    // If challenge is completed
    if (userChallenge.completed) return 100;
    
    // For carbon reduction challenges, calculate based on target
    if (challenge.type === 'carbon_reduction') {
      // This would need actual carbon reduction data from the user
      // For now, return a placeholder progress
      return 30; // Placeholder
    }
    
    // For other challenge types, return a placeholder
    return 50; // Placeholder
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    
    <ThemeProvider theme={darkTheme}>
      <Navbar />
      <Box sx={{ 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}
          
          <Paper sx={{ 
            mb: 4, 
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.light' }}>
              <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '2rem' }} />
              Contests & Challenges
            </Typography>
            
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
              Join challenges to earn points and compete with other users
            </Typography>
          </Paper>
          
          {!user?._id && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Please <Button color="primary" onClick={() => navigate('/login')}>login</Button> to join challenges and track your progress.
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {challenges.map((challenge) => {
              const userChallenge = userChallenges.find(uc => uc.challenge_id === challenge.id);
              const progress = calculateProgress(challenge);
              const timeRemaining = getTimeRemaining(challenge.end_date);
              const isCompleted = userChallenge?.completed || false;
              const isJoined = !!userChallenge;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      border: isCompleted ? '2px solid #4caf50' : 'none',
                      minHeight: '400px'
                    }}
                  >
                    {isCompleted && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Completed"
                        color="success"
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10,
                          zIndex: 1
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                        {challenge.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        paragraph 
                        sx={{ 
                          flexGrow: 1,
                          height: '4.5em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {challenge.description}
                      </Typography>
                      
                      <Box sx={{ mt: 'auto', mb: 2 }}>
                        <Chip 
                          icon={<CalendarTodayIcon />} 
                          label={`Ends: ${formatDate(challenge.end_date)}`} 
                          variant="outlined" 
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          icon={<TimerIcon />} 
                          label={timeRemaining} 
                          color={timeRemaining === 'Ended' ? 'error' : 'primary'}
                          variant="outlined" 
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label={`${challenge.points} points`} 
                          color="secondary" 
                          size="small"
                        />
                      </Box>
                      
                      {isJoined && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            Your Progress
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: alpha('#4caf50', 0.2),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'primary.main'
                              }
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {progress}% complete
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Divider sx={{ bgcolor: 'divider' }} />
                      
                      <CardActions sx={{ p: 2 }}>
                        {isCompleted ? (
                          <Button 
                            fullWidth 
                            variant="contained" 
                            color="success" 
                            startIcon={<CheckCircleIcon />}
                            disabled
                            sx={{ 
                              py: 1.5,
                              boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
                            }}
                          >
                            Completed
                          </Button>
                        ) : isJoined ? (
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            color="primary"
                            disabled
                            sx={{ py: 1.5 }}
                          >
                            Joined
                          </Button>
                        ) : (
                          <Button 
                            fullWidth 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleJoinChallenge(challenge.id)}
                            sx={{ 
                              py: 1.5,
                              boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
                            }}
                          >
                            Join Challenge
                          </Button>
                        )}
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {/* Login Dialog */}
          <Dialog 
            open={loginDialog} 
            onClose={() => setLoginDialog(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                bgcolor: 'background.paper',
              }
            }}
          >
            <DialogTitle>Login Required</DialogTitle>
            <DialogContent>
              <DialogContentText>
                You need to be logged in to join challenges and track your progress.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLoginDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleLoginRedirect} 
                color="primary" 
                variant="contained"
                sx={{ 
                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
                }}
              >
                Go to Login
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Contests; 