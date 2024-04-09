const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

//sendopt
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Reswswgistered`,
      });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    
    const result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    // console.log("OTP Body", otpBody);
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
    // console.log("Result is Generate OTP Func");
    // console.log("OTP", otp);
    // console.log("Result", result);
  } catch (error) {
    // console.log(error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//signUp

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      accountType,
      contactNumber,
    } = req.body;

    //validate krlo
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "ALL field are Required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and ConfirmPassword Value does not Match please try again",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    //Find the most recent OTP for the email

    const response_otp = await OTP.find({ email })
      .sort({ createAt: -1 })
      .limit(1);
    // console.log(response_otp);

    // validate
    if (response_otp.length == 0) {
      //OTP NOt FOund
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== response_otp[0].otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "The OTPs is not valid",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in DB

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      // approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    // console.log("error in signing ", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};
//loginin

exports.login = async (req, res) => {
  try {
    //data fetch
    const { email, password } = req.body;
    //validation on email and password
    if (!email || !password) {
      return (
        res.status(400),
        json({
          success: false,
          message: "Please fill all the details carefully",
        })
      );
    }

    // Find user with provided email
    let user = await User.findOne({ email }).populate("additionalDetails");
    // console.log(user);
    //if not a registered user
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email is not register",
      });
    }

    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };

    // console.log("payload", payload);

    //verify password & generate a JWt token
    if (await bcrypt.compare(password, user.password)) {
      const token =
        //password match
        jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

      // user = user.toObject();
      user.token = token;
      user.password = undefined;
      const option = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, option).status(200).json({
        success: "Login Successfully",
        token,
        user,
        message: "user is login in successfully",
      });
    } else {
      //password dp not match
      return res.status(403).json({
        success: "false",
        message: "Password Incorrect",
      });
    }
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure Please Try Again",
    });
  }
};

//changePassword
exports.changepassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);
    //  console.log("USERDETAILS"+userDetails)
    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    //Validation old password
    const isPAsswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPAsswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "The new password and confirm password does not match",
      });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // console.log("updatedUserDetails",updatedUserDetails);
    // try {
    //   const emailResponse = await mailSender(
    //     updatedUserDetails.email,
    //     "Password of your account has been update",
    //     passwordUpdated(
    //       updatedUserDetails.email,
    //       `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
    //     )
    //   );
    //   console.log("Email sent successfully ", emailResponse.response);
    // } catch (error) {
    //   console.error("Error occurred while sending email:", error);
    //   return res.status(500).json({
    //     success: false,
    //     message: "Error occurred while sending email",
    //     error: error.message,
    //   });
    // }
    return res
      .status(200)
      .json({ success: true, message: `Password updated successfully` });
  } catch (error) {
    // console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
