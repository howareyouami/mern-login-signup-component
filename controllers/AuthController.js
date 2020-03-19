const bcrypt = require("bcryptjs");
const User = require("../models/User"); // User model
const Joi = require('@hapi/joi');
const { registerSchema, loginSchema } = require('../utils/userValidations');
import sendEmail from '../utils/sendEmail'

exports.isAuth = (req, res, next) => {
  const sessUser = req.session.user;
  if (sessUser) {
    next();
  }
  else {
    err = res.status(401).json("You Need to Be Logged in to do this. Access Denied ")
    return err;
  }
};

exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;

  const result = registerSchema.validate({ name, email, password });
  if (!result.error) {

    // Check for existing user
    User.findOne({ email: email }).then((user) => {
      if (user) return res.status(400).json("User already exists");

      //New User created
      const newUser = new User({
        name,
        email,
        password
      });

      //Password hashing
      bcrypt.genSalt(12, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;
          // Save user
          newUser
            .save()
            .then(
              res.json("Successfully Registered")
            )
            .catch((err) => console.log(err));
        })
      );
    });
  } else {
    res.status(422).json(result.error.details[0].message);
  }

};

exports.loginUser = (req, res) => {
  const { email } = req.body;
  let currentUser
  // basic validation
  const result = loginSchema.validate({ email });
  if (!result.error) {
    try {
      User.findOne({ email: email }).then((user) => {
        if (!user) {
          //New User created
          user = new User({
            email,
          });
        }
        currentUser = user
  
        const otp = "1234"
        const otpGeneratedTime = Date.now()
    
        currentUser.otp = otp
        currentUser.otpGeneratedTime = otpGeneratedTime
        currentUser.isRegistered = false
    
        currentUser
          .save()
          .then(
            res.json("Successfully Saved")
          )
          .catch((err) => console.log(err));
      });

    }
    catch(e){
      res.status(422).json(e.message);
    }
  } else {
    console.log(result.error)
    res.status(422).json(result.error.details[0].message);
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    // delete session data from store, using sessionID in cookie
    if (err) throw err;
    res.clearCookie("session-id"); // clears cookie containing expired sessionID
    res.send("Logged out successfully");
  });
}

exports.authChecker = (req, res) => {
  const sessUser = req.session.user;
  if (sessUser) {
    return res.json(sessUser);
  } else {
    return res.status(401).json({ msg: "Unauthorized" });
  }
};