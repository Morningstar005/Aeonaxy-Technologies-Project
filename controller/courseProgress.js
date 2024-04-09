const SubSection = require("../models/SubSection")
const CourseProgress =require("../models/CourseProgress")


exports.updateCourseProgess = async(req,res)=>{
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  // console.log(courseId,subsectionId,userId)
    try{
        const subsection = await SubSection.findById(subsectionId)
        // console.log(subsection)
       if (!subsection) {
            return res.status(404).json({ error: "Invalid subsection" })
          }

          let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
          })

          // console.log(courseProgress)

          if (!courseProgress) {
            // If course progress doesn't exist, create a new one
            return res.status(404).json({
              success: false,
              message: "Course progress Does Not Exist",
            })
          }else {
            // If course progress exists, check if the subsection is already completed
            if (courseProgress.completedVideos.includes(subsectionId)) {
              return res.status(400).json({ error: "Subsection already completed" })
            }
      
            // Push the subsection into the completedVideos array
            courseProgress.completedVideos.push(subsectionId)
          }

          await courseProgress.save()

          return res.status(200).json({ message: "Course progress updated" })
    }
    catch (error) {
        // console.error(error)
        return res.status(500).json({ error: "Internal server error" })
      }
}