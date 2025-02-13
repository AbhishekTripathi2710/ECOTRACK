const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/userRoutes')
const cors = require("cors")
dotenv.config();

connectToDb();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res) => {
    res.send('hello world')
})

app.use('/users',userRoutes);

module.exports = app;