require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./authentication');
const cookieParser = require('cookie-parser');
const sequelize = require('./Database/connection');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const http=require("http")
const path=require("path")
// const { Server } = require("socket.io");










const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// app.use(express.static(path.resolve("./public")))
// const server =http.createServer(app)
// const io = new Server(server);
// io.on('connection', (socket) => {
//   socket.on("user-message", (message)=>{
//     io.emit("message io", message)
//   })
// });

// app.get('/', (req, res) => {
//   res.sendFile("./public/index.html")
// });



// server.listen(9000, ()=>{
//   console.log("websocket server is listening on 9000")
// })

app.use('/auth', authRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => {
  });
});
