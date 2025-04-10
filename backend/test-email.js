require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  try {
    console.log('Testing email service...');
    console.log('Using email:', process.env.EMAIL_USER);
    
    const result = await emailService.sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Test Email from EcoTrack',
      template: 'weekly-report',
      data: {
        name: 'Test User',
        totalEmissions: '25.5',
        emissionsChange: '-5.2 kg CO₂',
        emissionsChangeColor: '#4CAF50',
        goalProgress: '75.5',
        tips: [
          {
            title: 'Transportation Tips',
            description: 'Consider using public transportation or carpooling to reduce your carbon footprint.'
          },
          {
            title: 'Energy Conservation',
            description: 'Switch to energy-efficient appliances and remember to turn off lights when not in use.'
          },
          {
            title: 'Waste Reduction',
            description: 'Practice recycling and composting to reduce waste sent to landfills.'
          }
        ],
        dashboardUrl: 'http://localhost:3000/dashboard'
      }
    });

    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail(); 