const postModel = require("../models/postModel");

const createPost = async (req, res) => {
  try {
    const { title, slug, content, image, author, tags, category, published } =
      req.body;
    if (!title || !slug || !content || !author || !tags || !category) {
      return res.status(400).json({ success: false, message: "Empty fields" });
    }

    const existingPost = await postModel.findOne({ slug });
    if (existingPost) {
      return res
        .status(400)
        .json({ success: false, message: "Post by this slug already exists" });
    }

    const post = await postModel.create({
      title,
      slug,
      content,
      image,
      author,
      tags,
      published: published || false,
    });
    return res
      .status(201)
      .json({ success: false, message: "Post Created Successfully", post });
  } catch (error) {
    console.error("Error in Creating Blog Post:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const {published } = req.body;
    if(published === false){
        
    }
  } catch (error) {
    console.error("Error in getting Blog Post:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  createPost,
  getAllPosts
};
