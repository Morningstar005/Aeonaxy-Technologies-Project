const express = require("express")
const router = express.Router();
const {login,signUp,sendOtp,changepassword} = require("../controller/Auth")

const {resetPasswordToken,resetPassword} = require("../controller/ResetPassword")
const {auth} = require("../middleware/auth")

router.post("/login",login)
router.post("/signup",signUp)
router.post("/sendotp",sendOtp)
router.post("/changepassword", auth, changepassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

router.post("/reset-password-token",resetPasswordToken)
router.post("/reset-password",resetPassword)


// export

module.exports = router