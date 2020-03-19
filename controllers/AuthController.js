const bcrypt = require("bcryptjs");
const User = require("../models/User"); // User model
const { sendMail } = require("../utils/sendMail");
const { registerSchema, loginSchema } = require('../utils/userValidations');
const otpGenerator = require('otp-generator')

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

exports.loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    // basic validation
    const result = loginSchema.validate({ email });
    if (!result.error) {
      let currentUser = await User.findOne({ email: email })
      if (!currentUser) {
        //New User created
        currentUser = new User({
          email,
        });
      }
      const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
      const otpGeneratedTime = Date.now()

      currentUser.otp = otp
      currentUser.otpGeneratedTime = otpGeneratedTime
      currentUser.isRegistered = false
      const mailResponse = await sendMail(otp, email)
      console.log("mailResponse===>", mailResponse)
      if (!mailResponse.id) {
        throw new Error(mailResponse.message)
      }
      currentUser
        .save()
        .then(
          res.json("Successfully Sent mail")
        )
        .catch((err) => {
          throw new Error(err.message)
        });


    } else {
      console.log(result.error)
      throw new Error(result.error.details[0].message)
    }
  }
  catch (e) {
    res.status(422).json(e.message);
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