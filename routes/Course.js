const express = require("express");
const router = express.Router();

const { 
  createcourse,
  editCourse,
getInstructorCourses,
deleteCourse,
getFullCourseDetails } = require("../controller/Course");
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controller/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controller/Subsection");

const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middleware/auth");

const { showAllCourses, getCourseDetails } = require("../controller/Course");

const {
  createCategory,
  showAllCategory,
  categoryPageDetails,
} = require("../controller/Category");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controller/RatingAndReview");
const { updateCourseProgess } = require("../controller/courseProgress");

router.post("/createCourse", auth, isInstructor, createcourse);

router.post("/addSection", auth, isInstructor, createSection);

router.post("/updateSection", auth, isInstructor, updateSection);

router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/updateSubSection", auth, isInstructor, updateSubSection);

router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);

router.get("/getAllCourses", showAllCourses);

router.post("/getCourseDetails", getCourseDetails);

router.post("/editCourse",auth,isInstructor,editCourse)

router.get("/getInstructorCourses",auth,isInstructor,getInstructorCourses)

router.delete("/deleteCourse",auth,isInstructor,deleteCourse)

router.post("/getFullCourseDetails",auth,getFullCourseDetails)

router.post("/updateCourseProgress",auth,isStudent,updateCourseProgess)
//category routes(only by admin)

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategory", showAllCategory);
router.post("/categoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRating", getAllRating);


module.exports=router