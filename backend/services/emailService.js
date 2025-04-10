const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    this.templates = new Map();
  }

  async loadTemplate(templateName) {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName);
    }

    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    this.templates.set(templateName, template);
    return template;
  }

  async sendEmail({ to, subject, template, data }) {
    try {
      const templateFn = await this.loadTemplate(template);
      const html = templateFn(data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return {
        ...info,
        success: true
      };
    } catch (error) {
      console.error('Error sending email:', error);
      // Instead of throwing, return an error object
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  async sendWelcomeEmail(user) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Welcome to EcoTrack!',
      template: 'welcome',
      data: {
        name,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  }

  async sendWeeklyReport(user, reportData) {
    const subject = 'Your Weekly Carbon Footprint Report';
    
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    const data = {
      name,
      ...reportData
    };

    return this.sendEmail({
      to: email,
      subject,
      template: 'weekly-report',
      data
    });
  }

  async sendAchievementNotification(user, achievement) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'New Achievement Unlocked!',
      template: 'achievement',
      data: {
        name,
        achievement: {
          title: achievement.title,
          description: achievement.description,
          points: achievement.points
        }
      }
    });
  }

  async sendChallengeReminder(user, challenge) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Challenge Reminder',
      template: 'challenge-reminder',
      data: {
        name,
        challenge: {
          title: challenge.title,
          description: challenge.description,
          endDate: challenge.endDate
        }
      }
    });
  }

  async sendWeeklyEcoTips(user, tipsData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Your Weekly Eco-Tips',
      template: 'eco-tips',
      data: {
        name,
        ...tipsData
      }
    });
  }

  async sendMilestoneAlert(user, milestoneData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Milestone Achieved!',
      template: 'milestone',
      data: {
        name,
        ...milestoneData
      }
    });
  }

  async sendSuggestionEmail(user, suggestionData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Personalized Sustainability Suggestions',
      template: 'suggestions',
      data: {
        name,
        ...suggestionData
      }
    });
  }

  async sendAchievementUnlocked(user, achievementData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Achievement Unlocked!',
      template: 'achievement',
      data: {
        name,
        ...achievementData
      }
    });
  }

  async sendNewChallengeAlert(user, challengeData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'New Challenges Available!',
      template: 'new-challenges',
      data: {
        name,
        ...challengeData
      }
    });
  }

  async sendEducationalContent(user, contentData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Sustainability Education',
      template: 'educational',
      data: {
        name,
        ...contentData
      }
    });
  }

  async sendLocalEvents(user, eventsData) {
    // Handle both string (email) and object (user) parameters
    const email = typeof user === 'string' ? user : user.email;
    const name = typeof user === 'string' ? 'User' : (user.fullname?.firstname || user.username);
    
    return this.sendEmail({
      to: email,
      subject: 'Local Sustainability Events',
      template: 'local-events',
      data: {
        name,
        ...eventsData
      }
    });
  }
}

module.exports = new EmailService(); 