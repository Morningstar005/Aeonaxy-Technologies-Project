const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const CourseProgress = require("../models/CourseProgress");
const {convertSecondsToDuration} = require("../utils/secToDuration")
require("dotenv").config();


exports.createcourse = async (req, res) => {
  try {

    const userId = req.user.id;

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      status,
      instructions,
    } = req.body

    // console.log(courseName)

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

     // Convert the tag and instructions from stringified Array to Array
  //  const tag = JSON.parse(_tag)
    // const instructions = JSON.parse(_instructions)

    // console.log("tag", tag)
    // console.log("instructions", instructions)
    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }

    if (!status || status === undefined) {
      status = "Draft"
    }

    //check for instructor
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })

    // console.log("Instructor Details: ", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

     //check given tag is valid or not
     const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }


       //Upload Image top Cloudinary
       const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )

      const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        whatYouWillLearn: whatYouWillLearn,
        price,
        tag,
        category: categoryDetails._id,
        thumbnail: thumbnailImage.secure_url,
        status: status,
        instructions:instructions,
      })

     //add the new course to the user schema of Instructor
     await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )

    //add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
        //return response
        res.status(200).json({
          success: true,
          data: newCourse,
          message: "Course Created Successfully",
        })


  } 
  
  
  catch (error) {
    // console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};
//getAllCourses handler function

exports.showAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally
            const allCourses = await Course.find({ status: "Published"},
              {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnroled: true,
              }
              ).populate("instructor")
              .exec();

              return res.status(200).json({
                success: true,
                data: allCourses,
              });

    }
    catch(error) {
        // console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}

exports.getCourseDetails = async(req,res)=>{
  try{
    //get id
    const {courseId}=req.body 
    //finid course details
    const courseDetails = await Course.findOne({_id:courseId}).populate({
      path:"instructor",
      populate:{
        path:"additionalDetails",
      },
    })
    .populate("category")
    // .populate("RatingAndReview")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();

    //validation
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }



    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content)=>{
      content.subSection.forEach((subSection)=>{
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds+=timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)


    //return response
    return res.status(200).json({
      success: true,
      message: "Course Details fetched successfully",
      data:{
        courseDetails,totalDuration
      }
    });



  }catch(error){
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete the Course
exports.deleteCourse = async (req,res)=>{
  try{
    const {courseId} = req.body

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const studentsEnrolled = course.studentEnrolled
    for(const studentId of studentsEnrolled){
      User.findByIdAndUpdate(studentId,{
        $pull: { courses: courseId },
      })
    }

    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }
      await Section.findByIdAndDelete(sectionId)
    }

    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  }catch (error) {
    // console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Edit Course Details
exports.editCourse = async(req,res)=>{
  try{
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    if (req.files) {
      // console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

     // Update only the fields that are present in the request body
     for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      // .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })

  }catch (error) {
    // console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try{
    const instructorId = req.user.id
    
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).populate({
      path:"courseContent",
      populate: {
        path: "subSection",
      },
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  }catch (error) {
    // console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}

exports.getFullCourseDetails=async(req,res)=>{
  try{
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails= await Course.findOne({
      _id:courseId
    })
    .populate({
      path:"instructor",
      populate:{
        path:"additionalDetails"
      }
    })
    .populate("category")
    // .populate('ratingAndReviews')
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
    
    // console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content)=>{
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message,
  })
}
}