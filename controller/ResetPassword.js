const User = require("../models/User")
const mailSender=require("../utils/mailSender")
const bcrypt=require("bcrypt")
const crypto = require("crypto")
//resetPasswordTOken

exports.resetPasswordToken=async(req,res)=>{
    try{
        //get email from req body
    const email= req.body.email;
    //check user for this email,email validation
    const user= await User.findOne({email:email});
    if(!user){
        return res.json({success:false,
        message:`Your Email:${email} is not registered with us`})
    }

    //generate token
    const token=crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails= await User.findOneAndUpdate({email:email},
        {
            token:token,
            resetPasswordExpires:Date.now()+5*60*1000

        },
        {new:true})

    //create url
    const url=`http://localhost:5173/update-password/${token}`
    //send mail containing the url

    await mailSender(email,"Password Reset Link",
    `Password Reset Link: ${url}`);
    
    //return response
    
    return res.json({
        success:true,
        message:"Email sent successfully, please check email and change pwd"
    });

    }catch(error){
        return res.status(500).json({
            success:true,
            message:"Something went wrong while reset pwd and email"
        });
    }
}
//resetPassword

exports.resetPassword=async(req,res)=>{
    try{
        //data fetch
        const {password,confrimPassword,token}=req.body
        //validation
        if(password !==confrimPassword){
            return res.json({
                success:false,
                message:"Password not matching",
                 
            });
        }
        //get  userdetail from db using token
        const userDetail=await User.findOne({token:token})

        //if no entry - invalid token
        if(!userDetail){
            return res.json({
                success:false,
                message:"Token in invalid"
            })
        }
        //toekn time check
        if(userDetail.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:"Token in expired."
            })
        }
        //hash pwd
        const hashPassword= await bcrypt.hash(password,10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashPassword},
            {new:true},
        );

        return res.json({
            success:true,
            message:"Password is changed"
        })
        //return response
    }catch(error){
        return res.status(501).json({
            error : error.message,
        
            success:true,
            message:"Some Error in Updating the Password."
        });
    }
}