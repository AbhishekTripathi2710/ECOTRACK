import React, { useMemo } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Box,
    Chip,
    Button,
    Avatar
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Nature as EcoIcon,
    FlightTakeoff as FlightIcon,
    LocalDining as FoodIcon, 
    Bolt as EnergyIcon,
    Delete as WasteIcon,
    Smartphone as DeviceIcon,
    Check as CheckIcon,
    MoreHoriz as MoreIcon
} from '@mui/icons-material';

const CarbonReductionSuggestions = ({ carbonData }) => {
    const suggestions = useMemo(() => {
        if (!carbonData || !carbonData.currentFootprint) return [];

        const data = carbonData.currentFootprint;
        const suggestions = [];

        if (data.transportation) {
            const transport = data.transportation;
            
            if (transport.car > 5) {
                suggestions.push({
                    category: 'transportation',
                    title: 'Reduce Car Usage',
                    description: 'Your car emissions are higher than average. Consider carpooling or using public transport when possible.',
                    impact: 'high',
                    icon: <CarIcon />,
                    color: '#e53935' // red
                });
            }
            
            if (transport.flights > 2) {
                suggestions.push({
                    category: 'transportation',
                    title: 'Lower Flight Emissions',
                    description: 'Consider fewer flights or offset your travel emissions through carbon offset programs.',
                    impact: 'high',
                    icon: <FlightIcon />,
                    color: '#e53935' 
                });
            }
            
            if (transport.publicTransport < 3 && transport.car > 3) {
                suggestions.push({
                    category: 'transportation',
                    title: 'Use Public Transportation',
                    description: 'Increasing your use of public transport could significantly reduce your carbon footprint.',
                    impact: 'medium',
                    icon: <CarIcon />,
                    color: '#fb8c00' 
                });
            }
        }
        
        if (data.energy) {
            const energy = data.energy;
            
            if (energy.electricityBill > 80) {
                suggestions.push({
                    category: 'energy',
                    title: 'Reduce Electricity Usage',
                    description: 'Your electricity consumption is high. Try energy-efficient appliances and LED lighting.',
                    impact: 'high',
                    icon: <EnergyIcon />,
                    color: '#e53935' 
                });
            }
            
            if (energy.gasBill > 60) {
                suggestions.push({
                    category: 'energy',
                    title: 'Lower Heating Emissions',
                    description: 'Your heating emissions are significant. Consider better insulation or a programmable thermostat.',
                    impact: 'medium',
                    icon: <EnergyIcon />,
                    color: '#fb8c00' 
                });
            }
        }
        
        if (data.food) {
            const food = data.food;
            
            if (food.meatConsumption > 4) {
                suggestions.push({
                    category: 'food',
                    title: 'Reduce Meat Consumption',
                    description: 'Try incorporating more plant-based meals into your diet to reduce your carbon footprint.',
                    impact: 'high',
                    icon: <FoodIcon />,
                    color: '#e53935' // red
                });
            }
            
            if (food.localProducePercentage < 30) {
                suggestions.push({
                    category: 'food',
                    title: 'Choose Local Produce',
                    description: 'Buying local food reduces transportation emissions and supports local economy.',
                    impact: 'medium',
                    icon: <FoodIcon />,
                    color: '#fb8c00' // orange
                });
            }
        }
        
        // Waste suggestions
        if (data.waste && data.waste.recyclingPercentage < 50) {
            suggestions.push({
                category: 'waste',
                title: 'Increase Recycling',
                description: 'Improving your recycling habits can significantly reduce your waste footprint.',
                impact: 'medium',
                icon: <WasteIcon />,
                color: '#fb8c00' // orange
            });
        }
        
        // General suggestions if we have limited data
        if (suggestions.length < 3) {
            suggestions.push({
                category: 'general',
                title: 'Use Energy-Efficient Devices',
                description: 'Switch to energy-efficient appliances and electronics to reduce electricity consumption.',
                impact: 'medium',
                icon: <DeviceIcon />,
                color: '#fb8c00' // orange
            });
            
            suggestions.push({
                category: 'general',
                title: 'Plant Trees or Support Reforestation',
                description: 'Contribute to carbon offset projects that plant trees to absorb CO2.',
                impact: 'low',
                icon: <EcoIcon />,
                color: '#43a047' // green
            });
        }
        
        // Sort suggestions by impact (high to low)
        const impactOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        return suggestions.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
        
    }, [carbonData]);

    if (!suggestions.length) return null;

    const getImpactColor = (impact) => {
        switch(impact) {
            case 'high': return '#e53935'; // red
            case 'medium': return '#fb8c00'; // orange
            case 'low': return '#43a047'; // green
            default: return '#fb8c00'; // orange
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <EcoIcon sx={{ color: '#4caf50' }} /> Personalized Reduction Suggestions
            </Typography>
            <Grid container spacing={2}>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ 
                            width: '300px',
                            height: '100%', 
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'rgba(30, 30, 30, 0.8)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)'
                            }
                        }}>
                            <Box sx={{ 
                                p: 2, 
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Avatar sx={{ 
                                    bgcolor: suggestion.color, 
                                    width: 40, 
                                    height: 40 
                                }}>
                                    {suggestion.icon}
                                </Avatar>
                                <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem' }}>
                                    {suggestion.title}
                                </Typography>
                            </Box>
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2, flexGrow: 1 }}>
                                    {suggestion.description}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                    <Chip 
                                        label={`${suggestion.impact} impact`}
                                        size="small"
                                        sx={{ 
                                            bgcolor: `${getImpactColor(suggestion.impact)}20`, 
                                            color: getImpactColor(suggestion.impact),
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Button 
                                        size="small" 
                                        sx={{ 
                                            minWidth: 'auto', 
                                            color: '#4caf50' 
                                        }}
                                    >
                                        <CheckIcon fontSize="small" />
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {suggestions.length > 4 && (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                            variant="outlined" 
                            color="primary"
                            startIcon={<MoreIcon />}
                            sx={{ borderRadius: '8px' }}
                        >
                            See More Suggestions
                        </Button>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default CarbonReductionSuggestions; 