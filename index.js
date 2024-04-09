const express = require("express");
const app = express();
const userRouters = require("./routes/User");
const profileRouter = require("./routes/Profile");
const paymentRoutes = require("./routes/Payment");
const CourseRouter = require("./routes/Course");
const db = require("./config/database")
const cookieParser = require("cookie-parser");
const cors = require("cors");
const contactUsRoute = require("./routes/Contact")
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 8099;

//database connec
db.connect()
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin:"*",
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)

//cloudinary connection
cloudinaryConnect();
//routes
app.use("/api/v1/auth", userRouters);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/course", CourseRouter);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);



//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is listening at ${PORT}.`)
})