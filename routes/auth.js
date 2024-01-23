const express = require('express');
const passport = require('../authentication');
const model = require('../models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../Database/connection');

const router = express.Router();
const app = express();


// router.post('/login', async (req, res, next) => {
//   const { email, password } = req.body;
//   try {
//     // Validate that email and password are provided
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required.' });
//     }

//     // Check if the user exists in the database
//     let user = await model?.User.findOne({where: {email}});

//     if (!user) {
//       // If the user doesn't exist, create a new user with the provided credentials
//     //   const hashedPassword = await bcrypt.hash(password, 10);
//     //   user = await User.create({ email, password: hashedPassword });
//         return res.status(401).json({message: "No such user found!"});
//     } else {
//       // If the user exists, compare the provided hashed password
//       const passwordMatch = await bcrypt.compare(password, user.password);

//       if (!passwordMatch) {
//         return res.status(401).json({ message: 'Incorrect password.' });
//       }
//       else {
//         return res.status(200).json({message: "User Found!", user});
//       }
//     }

    // // Authenticate the user
    // passport.authenticate('local', (err, authenticatedUser, info) => {
    //   if (err) {
    //     return next(err);
    //   }

    //   if (!authenticatedUser) {
    //     return res.status(401).json({ message: info.message });
    //   }

    //   // Log in the user
    //   req.logIn(authenticatedUser, (loginErr) => {
    //     if (loginErr) {
    //       return next(loginErr);
    //     }

    //     return res.json({ message: 'Login successful', user: authenticatedUser });
    //   });
    // })(req, res, next);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });
// router.post('/login', passport.authenticate('local'), (req, res) => {
//     res.json({ message: 'Login successful', user: req.user });
//   });




router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      try {
        if (err) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials!' });
        }
  
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res.status(500).json({ message: 'Login failed' });
          }
        //  jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' }, (eror,token)=>{
        //   console.log("tokeeeeeeeeeen", token)
        //     res.json(token)
        //   });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '365d' });
          return res.status(200).json({ message: 'Login successful', user, token});
        });
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    })(req, res, next);
  });
  const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
    try {
      const decodedToken = req.headers.authorization.split(' ')[1];
      jwt.verify(decodedToken,process.env.JWT_SECRET)
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  };


  router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
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

router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await model.User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists. Please choose a different email.' });
    }

    // Create the new user without manually closing the connection
    const newUser = await model.User.create({ username, email, password });
    res.status(201).json({ message: 'User created successfully!', user: newUser });

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

  
 

  router.post('/logout', (req, res) => {
    try {
      // res.redirect("/login")
      res.status(200).json({ message: 'Logout successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
 
  // router.delete('/logout', (req, res) => {
  //   // Check if the user is authenticated (you might want to add more checks)
  //   if (req.isAuthenticated()) {
  //     console.log("req.isAuthenticated",req)
  //     // Perform logout actions (clear session, etc.)
  //     req.logout();
  //     res.redirect("/login")
  //     return res.status(200).json({ message: 'Logout successful' });
  //   } else {
  //     return res.status(401).json({ message: 'Unauthorized: Not logged in' });
  //   }
  // });

//   app.post('/logout', function(req, res, next){
//     req.logout(function(err) {
//       if (err) { return next(err); }
//       res.redirect('/');
//     });
//   })


// app.get('/logout', function(req, res, next) {
//   req.logout(function(err) {
//     if (err) { 
//       return next(err); 
//       }
//     // res.redirect('/');
//   });
// });

// router.post('/logout', (req, res) => {
//     try {
//       console.log("destroy req.logout", req.logout)
//       req.logout();
//       req.session.destroy((err) => {
//         if (err) {
//           console.error(err);
//           res.status(500).json({ message: 'Error destroying session' });
//         } else {
//           // Optionally, you can redirect after logout
//           res.status(200).json({ message: 'Logout successful' });
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });
module.exports = router;
