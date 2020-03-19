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
  try {
    const { firstName, lastName, refCode, userId } = req.body;
    User.findOne({ _id: userId }).then((user) => {
      if (!user) throw new Error("User not found")
      //User update
      user.firstName = firstName
      user.lastName = lastName
      user.refCode = refCode
      user.isRegistered = true
      user.save()
      res.json("REGISTERED");
    });

  } catch (error) {
    res.status(422).json(error.message);
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
        currentUser.isRegistered = false
      }
      const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
      const otpGeneratedTime = Date.now()

      currentUser.otp = otp
      currentUser.otpGeneratedTime = otpGeneratedTime
      const mailResponse = await sendMail(otp, email)
      console.log("mailResponse===>", mailResponse)
      if (!mailResponse.id) {
        throw new Error(mailResponse.message)
      }
      currentUser
        .save()
        .catch((err) => {
          throw new Error(err.message)
        });

      const sessUser = { id: currentUser.id, name: "new user", email: currentUser.email };
      req.session.user = sessUser; // Auto saves session data in mongo store

      res.json(sessUser); // sends cookie with sessionID automatically in response

    } else {
      console.log(result.error)
      throw new Error(result.error.details[0].message)
    }
  }
  catch (e) {
    res.status(422).json(e.message);
  }
};

exports.otpVerify = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    let currentUser = await User.findOne({ _id: userId })
    console.log("currentUser", currentUser)
    if (currentUser.otp === otp) {
      if (currentUser.isRegistered) {
        res.json({ status: "REGISTERED", userData: currentUser });
      } else {
        res.json({ status: "OTP_VERIFIED", userData: currentUser });
      }
    } else {
      throw new Error("Wrong otp")
    }
    console.log("otp===>", otp, "userId===>", userId, "currentUser.otp", currentUser.otp)
  } catch (error) {
    res.status(422).json(error.message);
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