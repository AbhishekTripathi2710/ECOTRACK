# EcoTrack - Carbon Footprint Tracker and Sustainability Platform

EcoTrack is a comprehensive web application designed to help users track, analyze, and reduce their carbon footprint through personalized recommendations, community engagement, and gamified challenges.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## 🌐 Overview

EcoTrack empowers users to make environmentally conscious decisions by providing tools to:
- Calculate their carbon footprint across various activities
- Track progress and visualize environmental impact over time
- Engage with a community of like-minded individuals
- Participate in sustainability challenges
- Receive personalized recommendations from an AI assistant

## ✨ Features

### User Authentication
- Secure registration and login system
- JWT-based authentication
- User profile management

### Carbon Footprint Calculator
- Multi-step wizard interface for data input
- Real-time calculations based on user activities
- Categories include transportation, home energy, diet, and more

### Analytics Dashboard
- Interactive data visualizations using Visx and Recharts
- Historical tracking of carbon emissions
- Comparative analytics with community averages

### Community Platform
- User discussion forums
- Sharing of sustainability tips and achievements
- Ability to follow other users and comment on posts

### Sustainability Challenges
- Time-bound environmental challenges
- Progress tracking for each challenge
- Achievement badges for completed challenges

### AI-Powered Sustainability Assistant
- Powered by Google's Generative AI
- Provides personalized sustainability recommendations
- Answers questions about carbon reduction strategies

## 🛠️ Tech Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Material UI**: Component library for modern UI design
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Visx/Recharts**: Data visualization libraries
- **Axios**: HTTP client for API requests
- **Framer Motion**: Animation library

### Backend
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database (via Mongoose)
- **JWT**: Authentication mechanism
- **Google Generative AI**: AI services integration
- **bcrypt**: Password hashing
- **Express Validator**: Request validation

### Development Tools
- **ESLint**: JavaScript linting
- **Nodemon**: Server auto-restart during development
- **dotenv**: Environment variable management

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # Reusable UI components
│   ├── config/         # Configuration files
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API service integrations
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
```

### Backend Structure
```
backend/
├── controllers/        # Request handlers
├── middleware/         # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic
├── ml_service/         # Machine learning service
├── community_service/  # Community features service
├── app.js              # Express application setup
└── server.js           # Server entry point
```

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

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
   - Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key
PORT=5000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🚢 Deployment

### Frontend Deployment
The frontend is built with Vite, which produces optimized static files for production deployment.

1. Build the frontend for production:
```bash
cd frontend
npm run build
```

2. The built files will be in the `dist` directory, which can be deployed to any static hosting service like:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

### Backend Deployment
The backend can be deployed to various cloud platforms:

1. **Heroku**:
   - Install the Heroku CLI
   - Initialize a Git repository in the backend directory
   - Create a Heroku app and push your code

   ```bash
   cd backend
   heroku create
   git push heroku main
   ```

2. **AWS Elastic Beanstalk**:
   - Create an Elastic Beanstalk environment
   - Deploy your application using the AWS CLI or console

3. **Docker & Kubernetes**:
   - A Dockerfile is provided for containerization
   - Deploy to any Kubernetes cluster or container orchestration platform

4. **MongoDB Atlas**:
   - Use MongoDB Atlas for the database service
   - Update the MONGODB_URI in your production environment variables

### Environment Setup for Production
For production deployment, ensure you set the following environment variables:

```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key
PORT=your_production_port
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/users/me` - Get current user profile

### Carbon Footprint Endpoints
- `POST /api/carbon/calculate` - Calculate carbon footprint
- `GET /api/carbon/history` - Get historical footprint data
- `POST /api/carbon/save` - Save a carbon footprint record

### Community Endpoints
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create a new post
- `POST /api/community/posts/:id/comments` - Comment on a post

### Challenges Endpoints
- `GET /api/challenges` - Get available challenges
- `POST /api/challenges/:id/join` - Join a challenge
- `GET /api/challenges/user` - Get user's active challenges

### AI Assistant Endpoints
- `POST /api/ai/chat` - Send a message to the AI assistant
- `GET /api/ai/history` - Get chat history

## 📸 Screenshots

> **Note:** The screenshot references below are placeholders. Please add actual screenshots of your application as you develop the different sections.

### Dashboard
![Dashboard](/screenshots/dashboard.png)
*The main dashboard showing carbon footprint metrics and recommendations*

### Carbon Calculator
![Carbon Calculator](/screenshots/calculator.png)
*Multi-step wizard interface for carbon footprint calculation*

### Analytics
![Analytics](/screenshots/analytics.png)
*Detailed visualization of carbon emissions over time*

### Community
![Community](/screenshots/community.png)
*Community forum with posts and interactions*

### Challenges
![Challenges](/screenshots/challenges.png)
*Available sustainability challenges with progress tracking*

### AI Assistant
![AI Assistant](/screenshots/assistant.png)
*Sustainability assistant providing personalized recommendations*

## 🏗️ Architecture

### System Architecture
EcoTrack follows a modern web application architecture with separated frontend and backend services:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│   Frontend  │◄────►│   Backend   │◄────►│  Database   │
│  (React.js) │      │ (Express.js)│      │ (MongoDB)   │
│             │      │             │      │             │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                            │
                     ┌──────▼──────┐
                     │             │
                     │ Google Gen  │
                     │     AI      │
                     │             │
                     └─────────────┘
```

### Data Flow
1. Users interact with the React.js frontend, which communicates with the Express.js backend via RESTful APIs
2. The backend processes requests, interacts with the MongoDB database, and returns responses
3. For AI-powered features, the backend communicates with Google's Generative AI API
4. Authentication is handled via JWT tokens, securing all API endpoints
5. Real-time data visualization is processed on the client side using Visx and Recharts

### Microservices
The backend is organized into several logical services:
- **Authentication Service**: Handles user registration, login, and token management
- **Carbon Calculation Service**: Processes user input and calculates carbon footprint
- **Community Service**: Manages posts, comments, and user interactions
- **Challenge Service**: Handles challenge enrollment and progress tracking
- **AI Service**: Integrates with Google's Generative AI for recommendations

## 🗓️ Roadmap

### Phase 1: Core Functionality (Completed)
- ✅ User authentication system
- ✅ Basic carbon footprint calculator
- ✅ Simple analytics dashboard
- ✅ Basic community features
- ✅ Initial UI implementation

### Phase 2: Enhanced Features (In Progress)
- ✅ Advanced carbon footprint calculator with more categories
- ✅ Interactive data visualizations
- ✅ Community platform with social features
- ✅ Sustainability challenges system
- ✅ AI-powered sustainability assistant
- 🔄 Dark mode implementation across all pages

### Phase 3: Advanced Features (Planned)
- 📅 Mobile-responsive design optimization
- 📅 Gamification elements (badges, levels, points)
- 📅 Team challenges for organizations
- 📅 Integration with smart home devices
- 📅 Offline mode support
- 📅 Push notifications

### Phase 4: Expansion (Future)
- 📅 Mobile app development (React Native)
- 📅 API for third-party integrations
- 📅 Advanced analytics with machine learning
- 📅 Carbon offset marketplace
- 📅 Community-driven sustainability projects

## 👥 Contributing

We welcome contributions from all team members! To contribute:

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git commit -m "Add your feature description"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a pull request on GitHub.

---

Built with ❤️ by the EcoTrack Team 