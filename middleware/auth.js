const JWT = require("jsonwebtoken"); //auth
require("dotenv").config();

//auth
exports.auth = (req, res, next) => {
  try {
    // console.log("BEFORE ToKEN EXTRACTION");
        //extract token
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer ", "");
        // console.log("AFTER ToKEN EXTRACTION");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "token is missing",
      });
    }

    try {
      const decode = JWT.verify(token, process.env.JWT_SECRET);
      // console.log(decode);

      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "something went wrong, while verify thee token",
    });
  }
};
///isStudent

exports.isStudent = (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//isAdmin
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//inInstructure
exports.isInstructor = async (req, res, next) => {
  try{
         if(req.user.accountType !== "Instructor") {
             return res.status(401).json({
                 success:false,
                 message:'This is a protected route for Instructor only',
             });
         }
         next();
  }
  catch(error) {
     return res.status(500).json({
         success:false,
         message:'User role cannot be verified, please try again'
     })
  }
 }
