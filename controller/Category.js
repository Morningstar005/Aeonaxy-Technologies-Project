const Category = require("../models/Category")
function getRandomInt(max){
    return Math.floor(Math.random() * max)
}
// create Tag ka handler function
exports.createCategory=async(req,res)=>{
    try{
        const {name,description}=req.body;
        if(!name || !description){
          return res.status(400).json({
            success:false,
            message:"ALL fields are required",

          })
        }
        const CategorysDetails = await Category.create({
            name:name,
            description:description,
        });
        // console.log(CategorysDetails)
        return res.status(200).json({
			success: true,
			message: "Category Created Successfully",
		});
    }catch(error){
       return res.status(500).json({
        success:true,
        message:error.message
       })

    }
}

//showAllCategory
exports.showAllCategory= async (req,res)=>{
    try{
        const allTags=await Category.find({})
        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allTags,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message 
    })
}
};

//categoryPageDetails 
exports.categoryPageDetails= async(req,res)=>{
    try{    
        
        
        const {categoryId} = req.body;
        // console.log(categoryId)
        const selectedCategory= await Category.findById(categoryId).populate({
          path:"courses",
          match:{status:"Published"},
          // populate:"ratingAndReview"
        }).exec()

    
      //       //console.log("SELECTED COURSE", selectedCategory)
      // // Handle the case when the category is not found
      if (!selectedCategory) {
        // console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }

        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            // console.log("No courses found for the selected category.")
            return res.status(404).json({
              success: false,
              message: "No courses found for the selected category.",
            })
          }

            // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()

         const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)

            return res.status(200).json({
                success:true,
                data: {
                  // selectedCategory
                    selectedCategory,
                    differentCategory,
                    mostSellingCourses
                },
            });

    }catch(error ) {
        // console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}