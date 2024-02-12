const express = require("express");
const passport = require("../authentication");
const model = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../Database/connection");
const cors = require("cors");
const router = express.Router();
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const { Server } = require("socket.io");
const crypto = require("crypto");

app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const authenticateUser = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.userId;
  } catch (error) {
    return null;
  }
};

function hashUserId(userId) {
  const secret = process.env.JWT_SECRET;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(userId.toString())
    .digest("hex");
  return hash;
}

io.use((socket, next) => {
  const { token } = socket.handshake.auth;

  if (!token) {
    return next(new Error("Unauthorized: Missing token"));
  }

  const userId = authenticateUser(token);

  if (!userId) {
    return next(new Error("Unauthorized: Invalid token"));
  }

  socket.userId = userId;
  next();
});

const users = {};
io.on("connection", (socket) => {
  // console.log("User connected:", socket?.id, "User ID:", socket?.userId);

  socket.on("check", (data) => {
    if (data !== undefined) {
      if (!users.hasOwnProperty(data.socketID)) {
        users[data.socketID] = {
          id: hashUserId(socket?.userId),
          username: data?.username,
          socketID: data.socketID,
        };
      }
      socket.broadcast.emit("active", users);
      socket.emit("active", users);
    }
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket?.id);
    delete users[socket?.id];
    io.emit("active", users);
  });
});

server.listen(9000, () => {
  // console.log("Server for websockets is listening on port 9000");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    try {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });
        return res
          .status(200)
          .json({ message: "Login successful", user, token });
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  })(req, res, next);
});
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }
  try {
    const decodedToken = req.headers.authorization.split(" ")[1];
    jwt.verify(decodedToken, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

// router.post('/signup', async (req, res) => {
//     try {
//       const { email, password,username } = req.body;
//       const existingUser = await model.User.findOne({ where: { email } });
//       if (existingUser) {
//         return res.status(400).json({ message: 'Email already exists. Please choose a different email.' });
//       }

//     //   const hashedPassword = await bcrypt.hash(password, 10);
//       (async () => {
//         try {
//           await sequelize.sync();
//           const newUser = await model.User.create({username, email, password });
//           await newUser.save()
//           res.status(201).json({ message: 'User created successfully!', user: newUser });

//         } catch (error) {
//           console.log("signup wala error",error)
//             res.status(500).json({ message: 'Internal Server Error' });
//           }
//         finally {
//           await sequelize.close();
//         }
//       })();

//     } catch (error) {
//       console.log("signup wala error",error)
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });

router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await model.User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists. Please choose a different email.",
      });
    }

    // Create the new user without manually closing the connection
    const newUser = await model.User.create({ username, email, password });
    res
      .status(201)
      .json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  try {
    // res.redirect("/login")
    res.status(200).json({ message: "Logout successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
