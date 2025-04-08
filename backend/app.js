const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/userRoutes');
const carbonRoutes = require("./routes/carbonRoutes");
const communityRoutes = require('./routes/communityRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cors = require("cors");

dotenv.config();

// Connect to MongoDB
connectToDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Routes
app.get('/',(req,res) => {
    res.send('hello world');
});

app.use('/api/users', userRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;