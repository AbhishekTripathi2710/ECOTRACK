import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  FormControlLabel, 
  Switch, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  Divider, 
  Button, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Grid
} from '@mui/material';
import { getEmailPreferences, updateEmailPreferences, sendTestEmail } from '../services/emailService';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    // Carbon Footprint Alerts
    weeklyReport: true,
    milestoneAlerts: true,
    suggestionEmails: true,
    
    // Challenge & Achievement Notifications
    challengeReminders: true,
    achievementNotifications: true,
    newChallengeAlerts: true,
    
    // Sustainability Tips & Education
    weeklyEcoTips: true,
    educationalContent: true,
    localEvents: true,
    
    // Email Frequency
    emailFrequency: 'immediate'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch user's email preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getEmailPreferences();
        if (data) {
          // Filter out timestamp fields and other non-preference fields
          const { 
            _id, userId, createdAt, updatedAt, __v, 
            lastWeeklyReportSent, lastMilestoneSent, lastSuggestionSent, 
            lastChallengeReminderSent, lastEcoTipSent, lastEducationalContentSent, 
            lastLocalEventSent,
            ...prefsOnly 
          } = data;
          
          setPreferences(prefsOnly);
        }
        setLoading(false);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load email preferences',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Handle preference changes
  const handleSwitchChange = (event) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked
    });
  };

  // Handle frequency changes
  const handleFrequencyChange = (event) => {
    setPreferences({
      ...preferences,
      emailFrequency: event.target.value
    });
  };

  // Save preferences
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmailPreferences(preferences);
      setSnackbar({
        open: true,
        message: 'Email preferences saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save email preferences',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle sending test email
  const handleSendTestEmail = async (emailType) => {
    try {
      setSnackbar({
        open: true,
        message: `Sending ${emailType} test email...`,
        severity: 'info'
      });
      
      await sendTestEmail(emailType);
      
      setSnackbar({
        open: true,
        message: `${emailType} test email sent successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Test email error in component:', error);
      setSnackbar({
        open: true,
        message: `Failed to send test email: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Email Notification Preferences
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Customize the emails you receive to stay updated on your sustainability journey.
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Carbon Footprint Alerts
          </Typography>
          
          <Box sx={{ ml: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.weeklyReport} 
                  onChange={handleSwitchChange} 
                  name="weeklyReport"
                  color="primary"
                />
              }
              label="Weekly Carbon Footprint Reports"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Receive a weekly summary of your carbon footprint with trends and tips.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.milestoneAlerts} 
                  onChange={handleSwitchChange} 
                  name="milestoneAlerts"
                  color="primary"
                />
              }
              label="Milestone Alerts"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Get notified when you reach carbon reduction milestones.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.suggestionEmails} 
                  onChange={handleSwitchChange} 
                  name="suggestionEmails"
                  color="primary"
                />
              }
              label="Personalized Suggestions"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Receive tailored suggestions for reducing your carbon footprint.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Challenge & Achievement Notifications
          </Typography>
          
          <Box sx={{ ml: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.challengeReminders} 
                  onChange={handleSwitchChange} 
                  name="challengeReminders"
                  color="primary"
                />
              }
              label="Challenge Reminders"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Receive reminders when your sustainability challenges are ending soon.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.achievementNotifications} 
                  onChange={handleSwitchChange} 
                  name="achievementNotifications"
                  color="primary"
                />
              }
              label="Achievement Unlocked Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Get notified when you earn badges or complete challenges.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.newChallengeAlerts} 
                  onChange={handleSwitchChange} 
                  name="newChallengeAlerts"
                  color="primary"
                />
              }
              label="New Challenge Alerts"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Stay informed about new sustainability challenges that match your interests.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Sustainability Tips & Education
          </Typography>
          
          <Box sx={{ ml: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.weeklyEcoTips} 
                  onChange={handleSwitchChange} 
                  name="weeklyEcoTips"
                  color="primary"
                />
              }
              label="Weekly Eco-Tips"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Receive weekly eco-friendly tips to reduce your environmental impact.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.educationalContent} 
                  onChange={handleSwitchChange} 
                  name="educationalContent"
                  color="primary"
                />
              }
              label="Educational Content"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Get educational articles and resources about environmental topics.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.localEvents} 
                  onChange={handleSwitchChange} 
                  name="localEvents"
                  color="primary"
                />
              }
              label="Local Sustainability Events"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 1 }}>
              Stay informed about sustainability events in your area.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Email Frequency
          </Typography>
          
          <FormControl component="fieldset" sx={{ ml: 2 }}>
            <RadioGroup 
              value={preferences.emailFrequency} 
              onChange={handleFrequencyChange}
              name="emailFrequency"
            >
              <FormControlLabel 
                value="immediate" 
                control={<Radio />} 
                label="Send emails as events occur"
              />
              <FormControlLabel 
                value="daily" 
                control={<Radio />} 
                label="Daily digest (receive a summary once a day)"
              />
              <FormControlLabel 
                value="weekly" 
                control={<Radio />} 
                label="Weekly digest (receive a summary once a week)"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
      
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Preferences'}
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            onClick={() => handleSendTestEmail('weeklyReport')}
            sx={{ mr: 2 }}
          >
            Test Weekly Report
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleSendTestEmail('weeklyEcoTips')}
          >
            Test Eco-Tips
          </Button>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailPreferences; 