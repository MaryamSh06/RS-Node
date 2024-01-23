require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./authentication');
const cookieParser = require('cookie-parser');
const sequelize = require('./Database/connection');
const authRoutes = require('./routes/auth');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => {
  });
});
