const Nodemailer= require("nodemailer")
require("dotenv").config()


const mailSender=async (email,title,body)=>{
   try{
    let transporter = Nodemailer.createTransport({
        host:process.env.MAIL_HOST,
        auth:{
            user:process.env.MAIL_USER,
            pass:process.env.MAIL_PASS
        },
     
    })
    let info = await transporter.sendMail({
        from:`StudyNotion - By Hemant Bhatagar`,
        to: `${email}`,
        subject: `${title}`,
        html:`${body}`,
    })

    // console.log("INFO", info);
    return info;

    
   }catch(err){
    console.log(err.message)
   } 
}

module.exports=mailSender