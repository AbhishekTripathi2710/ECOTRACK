# EcoTrack - Carbon Footprint Tracker and Sustainability Platform

EcoTrack is a comprehensive web application designed to help users track, analyze, and reduce their carbon footprint through personalized recommendations and community engagement.

## 📋 Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
  - [Carbon Footprint Calculator](#carbon-footprint-calculator)
  - [AI-Powered Recommendations](#ai-powered-recommendations)
  - [Community Features](#community-features)
  - [Gamification System](#gamification-system)
  - [Analytics and Insights](#analytics-and-insights)
- [Technical Implementation](#technical-implementation)
  - [Machine Learning Models](#machine-learning-models)
  - [Architecture](#architecture)
  - [Security Features](#security-features)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [API Documentation](#api-documentation)

## 🌐 Overview

EcoTrack is a full-stack application that combines machine learning, gamification, and community features to help users reduce their environmental impact. The platform uses advanced AI models to provide personalized recommendations and employs behavioral psychology principles to encourage sustainable habits.

## 🎯 Core Features

### 1. Carbon Footprint Calculator

#### Transportation Emissions
- **Daily Commute Tracking**
  - Input methods: Car, public transit, bicycle, walking
  - Distance calculation using Google Maps API
  - Vehicle-specific emissions based on make, model, and year
  - Fuel efficiency considerations

#### Home Energy Usage
- **Utility Bill Analysis**
  - Automatic bill parsing using OCR
  - Regional energy mix considerations
  - Seasonal adjustments
  - Smart device integration support

#### Diet and Consumption
- **Food Carbon Impact**
  - Detailed food category emissions
  - Meal planning suggestions
  - Restaurant order impact
  - Packaging consideration

#### Waste Management
- **Waste Tracking**
  - Recycling habits
  - Composting impact
  - Landfill contribution
  - Zero-waste goal setting

### 2. AI-Powered Recommendations

#### Machine Learning Implementation
- **Model Architecture**
  - Base Model: GPT-3.5-turbo
  - Fine-tuned on sustainability domain data
  - Context window: 4096 tokens
  - Temperature: 0.7 for creative suggestions

#### Training Data
- **Dataset Composition**
  - 50,000 sustainability expert recommendations
  - 10,000 peer-reviewed environmental papers
  - Real user success stories
  - Local environmental data

#### Recommendation Types
1. **Immediate Actions**
   - Quick wins with high impact
   - Cost-benefit analysis
   - Implementation difficulty rating

2. **Long-term Strategies**
   - Behavioral change suggestions
   - Infrastructure improvements
   - Investment recommendations

3. **Custom Recommendations**
   - Based on user location
   - Considering local climate
   - Available infrastructure
   - Economic factors

### 3. Community Features

#### Social Interaction
- **News Feed**
  - Achievement sharing
  - Tips and tricks
  - Challenge updates
  - Community polls

#### Collaborative Features
- **Group Challenges**
  - Team formation
  - Progress tracking
  - Shared goals
  - Leaderboards

#### Knowledge Sharing
- **Resource Library**
  - User-generated guides
  - Expert articles
  - Video tutorials
  - Success stories

### 4. Gamification System

#### Achievement System
- **Points Structure**
  - Daily actions: 1-10 points
  - Challenges: 10-100 points
  - Community contributions: 5-50 points
  - Milestone achievements: 100-1000 points

#### Badges and Levels
1. **Carbon Rookie** (0-100 points)
   - First steps badge
   - Calculator completion
   - Community join

2. **Carbon Warrior** (1000+ points)
   - Challenge completions
   - Consistent tracking
   - Community leadership

3. **Sustainability Champion** (5000+ points)
   - Major milestones
   - Community impact
   - Innovation contributions

### 5. Analytics and Insights

#### Personal Dashboard
- **Metrics Tracked**
  - Daily carbon footprint
  - Monthly trends
  - Year-over-year comparison
  - Goal progress

#### Community Comparisons
- **Benchmarking**
  - Local averages
  - Global rankings
  - Peer group comparison
  - Impact percentile

## 🔧 Technical Implementation

### Machine Learning Models

#### 1. Carbon Footprint Prediction Model
- **Architecture**: Random Forest Regressor
- **Features**:
  - Transportation patterns
  - Energy consumption
  - Dietary habits
  - Consumption patterns
- **Accuracy**: 92% on validation set
- **Update Frequency**: Weekly retraining

#### 2. Recommendation Engine
- **Primary Model**: GPT-3.5-turbo
- **Custom Layers**:
  - User preference embedding
  - Location-based context
  - Seasonal adjustments
- **Integration**: REST API with streaming support

#### 3. Community Pattern Analysis
- **Algorithm**: Collaborative Filtering
- **Purpose**: 
  - Similar user identification
  - Challenge recommendations
  - Content personalization

### Security Features

#### Authentication
- JWT-based token system
- Refresh token rotation
- Rate limiting
- 2FA support

#### Data Protection
- End-to-end encryption
- Regular security audits
- GDPR compliance
- Data anonymization

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance
- Google Generative AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecotrack.git
cd ecotrack
```

2. Install dependencies:
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup:
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

## 📚 Development Guide

### Code Structure

#### Frontend Architecture
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context
│   └── utils/          # Utility functions
```

#### Backend Architecture
```
backend/
├── controllers/        # Request handlers
├── models/            # Database models
├── services/          # Business logic
├── ml_service/        # ML implementation
└── routes/            # API routes
```

### API Documentation

#### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me
```

#### Carbon Footprint Endpoints
```
POST /api/footprint/calculate
GET /api/footprint/history
PUT /api/footprint/update
```

#### Community Endpoints
```
GET /api/community/feed
POST /api/community/post
GET /api/community/challenges
POST /api/community/join-challenge
```

#### AI Assistant Endpoints
```
POST /api/ai/chat
GET /api/ai/recommendations
POST /api/ai/feedback
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 