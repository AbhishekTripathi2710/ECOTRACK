import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useChallenges } from '../context/ChallengeContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getTopUsers, 
  getUserRank, 
  getAllChallenges, 
  joinChallenge, 
  getAllAchievements,
  getUserAchievements,
  getUserChallenges
} from '../services/communityService';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlagIcon from '@mui/icons-material/Flag';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import Navbar from "./navbar"

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
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
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

// Helper function to get a user-friendly description of achievement criteria
const getAchievementCriteriaText = (achievement) => {
  if (!achievement.criteria_type) return '';
  
  switch (achievement.criteria_type) {
    case 'points':
      return `Earn ${achievement.criteria_value} points`;
    case 'challenges':
      return `Complete ${achievement.criteria_value} challenge${achievement.criteria_value > 1 ? 's' : ''}`;
    case 'carbon_reduction':
      return `Reduce carbon footprint by ${achievement.criteria_value}%`;
    case 'duration':
      return `Maintain low footprint for ${achievement.criteria_value} month${achievement.criteria_value > 1 ? 's' : ''}`;
    case 'helping_others':
      return `Help ${achievement.criteria_value} user${achievement.criteria_value > 1 ? 's' : ''}`;
    default:
      return '';
  }
};

const Community = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { challenges: challengesFromContext, loading: loadingChallenges, error: errorChallenges, markChallengeComplete } = useChallenges();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loginDialog, setLoginDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeTab, setChallengeTab] = useState(0); // 0: All Challenges, 1: My Challenges
  const [challenges, setChallenges] = useState([]);
  
  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState({
    users: [],
    totalUsers: 0,
    period: 'weekly',
    limit: 10
  });
  const [userRank, setUserRank] = useState(null);
  
  // Challenges state
  const [userChallenges, setUserChallenges] = useState([]);
  
  // Achievements state
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);

  useEffect(() => {
    console.log('Community component mounted, user:', user);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch leaderboard data
        console.log('Fetching leaderboard data...');
        const leaderboardResult = await getTopUsers();
        console.log('Leaderboard result:', leaderboardResult);
        setLeaderboardData(leaderboardResult);
        
        if (user && (user._id || user.id)) {
          const userId = user._id || user.id;
          console.log('Fetching user rank for user ID:', userId);
          try {
            const userRankData = await getUserRank(userId);
            console.log('User rank data:', userRankData);
            setUserRank(userRankData);
          } catch (rankErr) {
            console.error('Error fetching user rank:', rankErr);
            // Don't set global error for just the rank
          }
        } else {
          console.log('User not logged in or missing ID, skipping rank fetch');
        }
        
        // Fetch challenges
        console.log('Fetching challenges...');
        const challengesData = await getAllChallenges();
        console.log('Challenges data:', challengesData);
        setChallenges(challengesData);
        
        // Fetch user challenges if user is logged in
        if (user && (user._id || user.id)) {
          const userId = user._id || user.id;
          console.log('Fetching user challenges for user ID:', userId);
          try {
            const userChallengesData = await getUserChallenges(userId);
            console.log('User challenges data:', userChallengesData);
            console.log('User challenges data type:', typeof userChallengesData);
            console.log('User challenges data length:', userChallengesData.length);
            console.log('First user challenge:', userChallengesData[0]);
            setUserChallenges(userChallengesData);
          } catch (challengeErr) {
            console.error('Error fetching user challenges:', challengeErr);
            // Don't set global error for just the challenges
          }
        } else {
          console.log('User not logged in or missing ID, skipping challenges fetch');
          setUserChallenges([]);
        }
        
        // Fetch achievements
        console.log('Fetching achievements...');
        const achievementsData = await getAllAchievements();
        console.log('Achievements data:', achievementsData);
        setAchievements(achievementsData);
        
        if (user && (user._id || user.id)) {
          const userId = user._id || user.id;
          console.log('Fetching user achievements for user ID:', userId);
          try {
            const userAchievementsData = await getUserAchievements(userId);
            console.log('User achievements data:', userAchievementsData);
            setUserAchievements(userAchievementsData);
          } catch (achieveErr) {
            console.error('Error fetching user achievements:', achieveErr);
            // Don't set global error for just the achievements
          }
        } else {
          console.log('User not logged in or missing ID, skipping achievements fetch');
        }
      } catch (err) {
        setError('Failed to load community data. Please try again later.');
        console.error('Error loading community data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleJoinChallenge = async (challengeId) => {
    console.log('Join challenge clicked, user:', user);
    
    if (!user || (!user.id && !user._id)) {
      console.log('User not logged in or missing ID');
      setLoginDialog(true);
      return;
    }

    const userId = user._id || user.id;
    console.log('User is logged in, joining challenge with ID:', challengeId, 'User ID:', userId);
    
    try {
      await joinChallenge(userId, challengeId);
      // Refresh challenges data
      const updatedChallenges = await getAllChallenges();
      setChallenges(updatedChallenges);
      
      // Refresh user challenges data
      console.log('Refreshing user challenges after joining');
      const updatedUserChallenges = await getUserChallenges(userId);
      console.log('Updated user challenges:', updatedUserChallenges);
      setUserChallenges(updatedUserChallenges);
      
      setSuccess('Successfully joined the challenge!');
    } catch (err) {
      setError('Failed to join challenge. Please try again.');
      console.error('Error joining challenge:', err);
    }
  };

  const handleLoginRedirect = () => {
    setLoginDialog(false);
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMarkAsDone = async (challengeId) => {
    try {
      await markChallengeComplete(challengeId);
      addNotification(`Challenge completed!`, 'challenge');
    } catch (error) {
      console.error('Error marking challenge as done:', error);
    }
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {!user && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please <Button color="primary" onClick={() => navigate('/login')}>login</Button> to participate in challenges and track your achievements.
            </Alert>
          )}

          <Paper sx={{ 
            mb: 4, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 500,
                  fontSize: '1rem'
                }
              }}
            >
              <Tab icon={<EmojiEventsIcon />} label="Leaderboard" />
              <Tab icon={<FlagIcon />} label="Challenges" />
              <Tab icon={<StarIcon />} label="Achievements" />
            </Tabs>
          </Paper>

          {/* Add a link to the Contests page */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/contests')}
              startIcon={<EmojiEventsIcon />}
              sx={{ 
                py: 1.5, 
                px: 3,
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
              }}
            >
              View All Contests
            </Button>
          </Box>

          {/* Leaderboard Tab */}
          {activeTab === 0 && (
            <Box mt={3}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.light', mb: 3 }}>
                {leaderboardData.period ? `Top Users (${leaderboardData.period})` : 'Top Users'}
              </Typography>
              
              {/* Show message if no users have points */}
              {leaderboardData.users && leaderboardData.users.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No users have earned points yet. Be the first to complete challenges or calculate your carbon footprint!
                </Alert>
              )}
              
              {/* Show user's rank if available */}
              {userRank && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Your current rank: #{userRank.rank} with {userRank.total_points} points
                </Alert>
              )}
              
              {/* List of top users */}
              <Paper sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
              }}>
                <List>
                  {leaderboardData.users && leaderboardData.users.map((user, index) => (
                    <ListItem 
                      key={user.user_id} 
                      divider 
                      sx={{ 
                        py: 2,
                        bgcolor: index < 3 ? alpha('#4caf50', 0.1) : 'background.paper',
                        '&:hover': {
                          bgcolor: alpha('#4caf50', 0.05)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: index === 0 ? '#ffd700' : 
                                    index === 1 ? '#c0c0c0' : 
                                    index === 2 ? '#cd7f32' : 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {user.display_name || `User ${user.user_id.substring(0, 5)}...`}
                          </Typography>
                        } 
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {user.points} points
                          </Typography>
                        } 
                      />
                      {index < 3 && (
                        <EmojiEventsIcon 
                          sx={{ 
                            color: index === 0 ? '#ffd700' : 
                                   index === 1 ? '#c0c0c0' : '#cd7f32',
                            fontSize: '2rem'
                          }} 
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          {/* Challenges Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                mb: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
              }}>
                <Tabs 
                  value={challengeTab} 
                  onChange={(e, newValue) => setChallengeTab(newValue)} 
                  aria-label="challenge tabs"
                  sx={{ 
                    '& .MuiTab-root': {
                      py: 2,
                      fontWeight: 500,
                      fontSize: '1rem'
                    }
                  }}
                >
                  <Tab label="All Challenges" />
                  <Tab label="My Challenges" />
                </Tabs>
              </Box>
              
              {/* All Challenges Tab */}
              {challengeTab === 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.light', mb: 3 }}>
                    Active Challenges
                  </Typography>
                  {challenges.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      No active challenges available at the moment.
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {challenges.map((challenge) => {
                        const userChallenge = userChallenges.find(uc => uc.id === challenge.id);
                        const isJoined = !!userChallenge;
                        const isCompleted = userChallenge?.completed === 1 || userChallenge?.completed === true;
                        const progress = userChallenge?.progress || 0;
                        
                        return (
                          <Grid item xs={12} md={6} key={challenge.id}>
                            <Card sx={{ 
                              position: 'relative', 
                              border: isCompleted ? '2px solid #4caf50' : 'none',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              minHeight: '100px',
                              maxWidth: '300px'
                            }}>
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
                                <Typography variant="h6" gutterBottom>{challenge.title}</Typography>
                                <Typography 
                                  color="textSecondary" 
                                  sx={{ 
                                    flexGrow: 1,
                                    height: '4.5em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    mb: 2
                                  }}
                                >
                                  {challenge.description}
                                </Typography>
                                <Box sx={{ mt: 'auto' }}>
                                  <Chip 
                                    label={`${challenge.points} points`} 
                                    color="secondary" 
                                    size="small"
                                    sx={{ mb: 2 }}
                                  />
                                  
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
                                </Box>
                              </CardContent>

                              <Box sx={{ mt: 'auto' }}>
                                <Divider />
                                <CardActions>
                                  {!isJoined ? (
                                    <Button 
                                      fullWidth 
                                      variant="contained" 
                                      color="primary"
                                      onClick={() => handleJoinChallenge(challenge.id)}
                                      disabled={!user}
                                      sx={{ 
                                        py: 1.5,
                                        boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
                                      }}
                                    >
                                      {user ? 'Join Challenge' : 'Login to Join'}
                                    </Button>
                                  ) : !isCompleted ? (
                                    <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                                      <Button 
                                        variant="outlined" 
                                        color="primary"
                                        sx={{ flex: 1 }}
                                        disabled
                                      >
                                        In Progress
                                      </Button>
                                      <Tooltip title="Mark as Done">
                                        <IconButton 
                                          color="success"
                                          onClick={() => handleMarkAsDone(challenge.id)}
                                          sx={{ 
                                            border: '1px solid #4caf50',
                                            '&:hover': { 
                                              backgroundColor: alpha('#4caf50', 0.1) 
                                            }
                                          }}
                                        >
                                          <CheckIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  ) : (
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
                                  )}
                                </CardActions>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              )}
              
              {/* My Challenges Tab */}
              {challengeTab === 1 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.light', mb: 3 }}>
                    My Active Challenges
                  </Typography>
                  {userChallenges.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      You haven't joined any challenges yet. Check out the available challenges and join one to start earning points!
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {userChallenges.map((userChallenge) => {
                        const isCompleted = userChallenge.completed === 1 || userChallenge.completed === true;
                        
                        const progress = userChallenge.progress || 0;
                        
                        console.log('Rendering challenge:', userChallenge.title, 'Progress:', progress, 'Completed:', isCompleted);
                        
                        return (
                          <Grid item xs={12} md={6} key={userChallenge.id}>
                            <Card sx={{ 
                              position: 'relative', 
                              border: isCompleted ? '2px solid #4caf50' : 'none',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              minHeight: '400px'
                            }}>
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
                                <Typography variant="h6" gutterBottom>{userChallenge.title}</Typography>
                                <Typography 
                                  color="textSecondary" 
                                  sx={{ 
                                    flexGrow: 1,
                                    height: '4.5em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    mb: 2
                                  }}
                                >
                                  {userChallenge.description}
                                </Typography>
                                <Box sx={{ mt: 'auto' }}>
                                  <Chip 
                                    label={`${userChallenge.points} points`} 
                                    color="secondary" 
                                    size="small"
                                    sx={{ mb: 2 }}
                                  />
                                  
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
                                </Box>
                              </CardContent>

                              <Box sx={{ mt: 'auto' }}>
                                <Divider />
                                <CardActions>
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
                                  ) : (
                                    <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                                      <Button 
                                        variant="outlined" 
                                        color="primary"
                                        sx={{ flex: 1 }}
                                        disabled
                                      >
                                        In Progress
                                      </Button>
                                      <Tooltip title="Mark as Done">
                                        <IconButton 
                                          color="success"
                                          onClick={() => handleMarkAsDone(userChallenge.id)}
                                          sx={{ 
                                            border: '1px solid #4caf50',
                                            '&:hover': { 
                                              backgroundColor: alpha('#4caf50', 0.1) 
                                            }
                                          }}
                                        >
                                          <CheckIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  )}
                                </CardActions>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Achievements Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.light', mb: 3 }}>
                Achievements
              </Typography>
              <Grid container spacing={3}>
                {achievements.map((achievement) => {
                  const userAchievement = userAchievements.find(ua => ua.id === achievement.id);
                  const isUnlocked = !!userAchievement;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          p: 3,
                          borderRadius: 4,
                          bgcolor: isUnlocked ? 'background.paper' : alpha('#1e1e1e', 0.5),
                          boxShadow: isUnlocked 
                            ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
                            : '0 4px 20px rgba(0, 0, 0, 0.15)',
                          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: isUnlocked 
                              ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
                              : '0 8px 25px rgba(0, 0, 0, 0.2)',
                          },
                          position: 'relative',
                          overflow: 'hidden',
                          height: '100%',
                          width: '300px',
                          border: isUnlocked ? '2px solid #4caf50' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {/* Badge Circle */}
                        <Box 
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 2,
                            bgcolor: isUnlocked ? 'primary.main' : alpha('#757575', 0.3),
                            boxShadow: isUnlocked 
                              ? '0 0 20px rgba(76, 175, 80, 0.5)' 
                              : '0 0 20px rgba(0, 0, 0, 0.2)',
                            border: isUnlocked ? '3px solid #4caf50' : '3px solid #757575',
                          }}
                        >
                          {isUnlocked ? (
                            <Avatar 
                              src={achievement.badge_url}
                              alt={achievement.title}
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                backgroundColor: 'primary.main' 
                              }}
                            >
                              <EmojiEventsIcon sx={{ fontSize: 50, color: '#ffffff' }} />
                            </Avatar>
                          ) : (
                            <LockIcon sx={{ fontSize: 50, color: '#b0b0b0' }} />
                          )}
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          align="center" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 600,
                            color: isUnlocked ? 'text.primary' : 'text.secondary'
                          }}
                        >
                          {achievement.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          align="center" 
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {achievement.description}
                        </Typography>
                        
                        <Chip 
                          label={getAchievementCriteriaText(achievement)}
                          size="small"
                          sx={{ 
                            bgcolor: isUnlocked ? alpha('#4caf50', 0.2) : alpha('#757575', 0.2),
                            color: isUnlocked ? '#4caf50' : '#b0b0b0',
                            mb: 1
                          }}
                        />
                        
                        {isUnlocked && (
                          <Typography 
                            variant="caption" 
                            align="center" 
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        <Chip 
                          label={`${achievement.points} points`}
                          size="small"
                          sx={{ 
                            bgcolor: isUnlocked ? alpha('#4caf50', 0.2) : alpha('#757575', 0.2),
                            color: isUnlocked ? '#4caf50' : '#b0b0b0',
                            mt: 1
                          }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

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

export default Community; 