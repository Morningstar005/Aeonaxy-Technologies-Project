const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require ("../mail/templates/emailVerificationTemplate")

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires:60*10  // The document will be automatically deleted after 5 minutes of its creation time
  },
});

// Define a function to send emails

async function sendVerificationEmail(email,otp){
  try{
    console.log("I'm in sendVerificationEmail")
    const mailresponse= await mailSender(email,"Verification Email" , emailTemplate(otp))
    // console.log("Email send Successfully:",mailresponse.response)
  }
  catch(error){
    console.log("error occured while sending mails", error);
    throw error
  }
}


// Define a post-save hook to send email after the document has been saved
otpSchema.pre("save", async function (next){

  // Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
})

module.exports = mongoose.model("OTP", otpSchema);
