const { contactFormRes } = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")
const {contactform} = require("../mail/templates/selfcontactform")
const selfmail = "hemantbhatnagar0005@gmail.com"

exports.contactUsController = async (req, res) => {
  const { email, firstname, lastname, message, phoneNo, countrycode } = req.body
  // console.log(req.body)
  try {
    // console.log("in")
    const emailRes = await mailSender(
      email,
      "Your Data send successfully",
      contactFormRes(email, firstname, lastname, message, phoneNo, countrycode)
    )
    const response = await mailSender(
      selfmail,
      "You have message",
      contactform(email, firstname, lastname, message, phoneNo, countrycode)
    )
    // console.log("in")

    // console.log("Email Res ", emailRes)
    return res.json({
      success: true,
      message: "Email send successfully",
    })
  } catch (error) {
    // console.log("Error", error)
    // console.log("Error message :", error.message)
    return res.json({
      success: false,
      message: "Something went wrong...",
    })
  }
}
