import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "../context/UserContext"
import { useCarbonFootprint } from "../context/carbonFootprintContext"
import { format, parseISO, isValid } from "date-fns";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import Navbar from "../components/navbar"
import Footer from "../components/Footer"
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    LinearProgress,
    Chip,
    Avatar,
    CircularProgress,
    Badge,
    Divider,
    Button
} from '@mui/material'
import {
    EmojiEvents as TrophyIcon,
    CheckCircle as CheckCircleIcon,
    Star as StarIcon,
    AccessTime as TimeIcon,
    Nature as EcoIcon
} from '@mui/icons-material'
import { getAllChallenges, getUserChallenges, getAllAchievements, getUserAchievements } from "../services/communityService"

const Home = () => {
    const { user } = useContext(UserContext)
    const { currentFootprint, monthlyData, footprintHistory, loading } = useCarbonFootprint()
    const [footprintBreakdown, setFootprintBreakdown] = useState([])
    const [challenges, setChallenges] = useState([])
    const [userChallenges, setUserChallenges] = useState([])
    const [achievements, setAchievements] = useState([])
    const [userAchievements, setUserAchievements] = useState([])
    const [challengesLoading, setChallengesLoading] = useState(true)
    const [achievementsLoading, setAchievementsLoading] = useState(true)

    useEffect(() => {
        if (currentFootprint) {
            // Construct footprint breakdown safely
            const breakdown = [
                { name: "Public Transport", value: currentFootprint.transportation?.publicTransport || 0 },
                { name: "Car", value: currentFootprint.transportation?.car || 0 },
                { name: "Bike", value: currentFootprint.transportation?.bike || 0 },
                { name: "Flights", value: currentFootprint.transportation?.flights || 0 },
                { name: "Electricity", value: currentFootprint.energy?.electricityBill || 0 },
                { name: "Gas", value: currentFootprint.energy?.gasBill || 0 }
            ];
            setFootprintBreakdown(breakdown);
        }
    }, [currentFootprint])

    // Fetch challenges and achievements
    useEffect(() => {
        const fetchChallengesAndAchievements = async () => {
            if (user && user._id) {
                try {
                    setChallengesLoading(true);
                    setAchievementsLoading(true);
                    
                    // Fetch challenges data
                    const allChallenges = await getAllChallenges();
                    setChallenges(allChallenges || []);
                    
                    const userChallengesData = await getUserChallenges(user._id);
                    setUserChallenges(userChallengesData || []);
                    
                    // Fetch achievements data
                    const allAchievements = await getAllAchievements();
                    setAchievements(allAchievements || []);
                    
                    const userAchievementsData = await getUserAchievements(user._id);
                    setUserAchievements(userAchievementsData || []);
                } catch (err) {
                    console.error("Error fetching challenges/achievements:", err);
                } finally {
                    setChallengesLoading(false);
                    setAchievementsLoading(false);
                }
            }
        };
        
        fetchChallengesAndAchievements();
    }, [user]);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042",]

    const renderBadgeIcon = (index) => {
        const icons = [
            <StarIcon sx={{ fontSize: 30, color: 'white' }} />,
            <TrophyIcon sx={{ fontSize: 30, color: 'white' }} />,
            <CheckCircleIcon sx={{ fontSize: 30, color: 'white' }} />
        ];
        return icons[index % icons.length];
    };

    if (loading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen">
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="text-2xl">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar></Navbar>
            {currentFootprint?.carbonFootprint > 30 && (
                <div className="bg-red-600 text-white p-4 mb-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">⚠ High Carbon Footprint Alert!</h3>
                    <p>Your daily footprint is <strong>{currentFootprint.carbonFootprint.toFixed(2)} kg CO₂</strong>. Consider reducing your emissions.</p>
                </div>
            )}
            <main className="max-w-7xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Daily Footprint Card */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Today's Footprint</h2>
                        <p className="text-4xl font-bold">
                            {currentFootprint ? `${currentFootprint.carbonFootprint.toFixed(2)} kg CO₂` : "No data"}
                        </p>
                    </div>

                    {/* Monthly Footprint Card */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">This Month's Footprint</h2>
                        <p className="text-4xl font-bold">
                            {monthlyData.length > 0 
                                ? `${monthlyData.reduce((sum, entry) => sum + entry.carbonFootprint, 0).toFixed(2)} kg CO₂` 
                                : "No data"}
                        </p>
                    </div>
                </div>

                {/* User Achievements Section */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-green-400">Your Achievements</h2>
                        <Link to="/community" className="text-green-400 hover:text-green-300 text-sm">
                            View All →
                        </Link>
                    </div>
                    
                    {achievementsLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <CircularProgress size={40} sx={{ color: '#4caf50' }} />
                        </div>
                    ) : userAchievements.length > 0 ? (
                        <Grid container spacing={2} className="mb-4">
                            {userAchievements.slice(0, 3).map((achievement, index) => (
                                <Grid item xs={12} sm={4} key={achievement.id}>
                                    <Paper 
                                        sx={{ 
                                            p: 2, 
                                            bgcolor: 'rgba(40, 40, 40, 0.8)', 
                                            borderRadius: 3,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                                            border: '1px solid rgba(76, 175, 80, 0.3)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                            }
                                        }}
                                    >
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <Avatar sx={{ width: 22, height: 22, bgcolor: '#4caf50', fontSize: 14 }}>
                                                    <CheckCircleIcon fontSize="small" />
                                                </Avatar>
                                            }
                                        >
                                            <Avatar 
                                                sx={{ 
                                                    width: 60, 
                                                    height: 60, 
                                                    bgcolor: '#4caf50',
                                                    mb: 1,
                                                    boxShadow: '0 4px 8px rgba(76, 175, 80, 0.5)'
                                                }}
                                            >
                                                {renderBadgeIcon(index)}
                                            </Avatar>
                                        </Badge>
                                        <Typography 
                                            variant="h6" 
                                            align="center"
                                            sx={{ 
                                                fontSize: '1rem', 
                                                fontWeight: 600,
                                                color: 'white',
                                                mt: 1
                                            }}
                                        >
                                            {achievement.title}
                                        </Typography>
                                        <Chip 
                                            label={`${achievement.points || 0} points`} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'rgba(76, 175, 80, 0.2)', 
                                                color: '#81c784',
                                                mt: 1
                                            }} 
                                        />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Paper 
                            sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(40, 40, 40, 0.5)', 
                                borderRadius: 2,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                                You haven't earned any achievements yet.
                            </Typography>
                            <Button 
                                component={Link}
                                to="/community"
                                variant="outlined"
                                color="primary"
                                size="small"
                            >
                                Explore Achievements
                            </Button>
                        </Paper>
                    )}
                </div>

                {/* User Challenges Section */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-green-400">Active Challenges</h2>
                        <Link to="/contests" className="text-green-400 hover:text-green-300 text-sm">
                            View All →
                        </Link>
                    </div>
                    
                    {challengesLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <CircularProgress size={40} sx={{ color: '#4caf50' }} />
                        </div>
                    ) : userChallenges.length > 0 ? (
                        <Grid container spacing={2} className="mb-4">
                            {userChallenges.slice(0, 3).map((challenge) => (
                                <Grid item xs={12} key={challenge.id}>
                                    <Paper 
                                        sx={{ 
                                            p: 3, 
                                            bgcolor: 'rgba(40, 40, 40, 0.8)', 
                                            borderRadius: 3,
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                                            border: '1px solid rgba(76, 175, 80, 0.3)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            width: '300px'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ color: 'white', mb: 0.5 }}>
                                                    {challenge.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <TimeIcon sx={{ fontSize: 14, color: '#b0b0b0', mr: 0.5 }} />
                                                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                                        {challenge.daysLeft ? `${challenge.daysLeft} days left` : 'Ongoing'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip 
                                                label={challenge.progress >= 100 ? 'Completed' : 'In Progress'} 
                                                size="small"
                                                color={challenge.progress >= 100 ? 'success' : 'primary'}
                                                variant={challenge.progress >= 100 ? 'filled' : 'outlined'}
                                            />
                                        </Box>
                                        
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: '#b0b0b0', 
                                                mb: 2,
                                                height: '3em',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {challenge.description}
                                        </Typography>
                                        
                                        <Box sx={{ mt: 'auto' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                                    Progress
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                    {challenge.progress}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={challenge.progress} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 4,
                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#4caf50',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Paper 
                            sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(40, 40, 40, 0.5)', 
                                borderRadius: 2,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                                You haven't joined any challenges yet.
                            </Typography>
                            <Button 
                                component={Link}
                                to="/contests"
                                variant="outlined"
                                color="primary"
                                size="small"
                            >
                                Join Challenges
                            </Button>
                        </Paper>
                    )}
                </div>

                {/* Footprint History Chart */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg chart-container">
                    <h2 className="text-2xl font-semibold text-green-400 mb-4">Your Carbon Footprint History</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={footprintHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#888"
                                tickFormatter={(tick) => {
                                    const parsedDate = parseISO(tick);
                                    return isValid(parsedDate) ? format(parsedDate, "MMM dd, HH:mm") : "Invalid Date";
                                }} 
                            />
                            <YAxis stroke="#888" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "#333", border: "none" }} 
                                labelFormatter={(label) => {
                                    const parsedLabel = parseISO(label);
                                    return isValid(parsedLabel) ? format(parsedLabel, "PPpp") : "Invalid Date";
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="carbonFootprint" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Footprint Breakdown */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Footprint Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={footprintBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(footprintBreakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Category Comparison</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={footprintBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-green-400 mb-4">Tips to Reduce Your Footprint</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Use public transportation or carpool when possible</li>
                        <li>Switch to energy-efficient appliances</li>
                        <li>Reduce meat consumption and opt for plant-based meals</li>
                        <li>Recycle and compost to minimize waste</li>
                        <li>Use renewable energy sources like solar panels</li>
                    </ul>
                </div>
            </main>

            <Footer></Footer>
        </div>
    )
}

export default Home

