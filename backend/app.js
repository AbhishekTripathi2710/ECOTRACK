const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/userRoutes');
const carbonRoutes = require("./routes/carbonRoutes");
const communityRoutes = require('./routes/communityRoutes');
const aiRoutes = require('./routes/aiRoutes');
const emailRoutes = require('./routes/emailRoutes');
const emailScheduler = require('./services/emailScheduler');
const cors = require("cors");

dotenv.config();

connectToDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res) => {
    res.send('hello world');
});

app.use('/api/users', userRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/email', emailRoutes);

if (process.env.NODE_ENV !== 'test') {
    emailScheduler.initializeSchedulers();
    console.log('Email schedulers initialized');
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;