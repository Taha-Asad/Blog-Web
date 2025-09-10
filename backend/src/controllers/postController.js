const postModel = require("../models/postModel");

const createPost = async (req, res) => {
  try {
    const { title, slug, content, image, author, tags, category, status } =
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
      category,
      status: status || "Published",
    });
    return res
      .status(201)
      .json({ success: false, message: "Post Created Successfully", post });
  } catch (error) {
    console.error("Error in Creating Blog Post:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all blog posts (admin)
const getAllBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const blogs = await postModel
      .find(query)
      .populate("author", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get comment counts for each blog
    const blogsWithComments = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({
          blogId: blog._id,
          status: "approved", // Only count approved comments
        });

        return {
          ...blog.toObject(),
          commentCount,
        };
      })
    );

    const total = await postModel.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs: blogsWithComments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get public blog posts (for users)
const getPublicPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { status: "Published" };

    console.log("Fetching public blog posts with query:", query);

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const blogs = await postModel
      .find(query)
      .populate("author", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get comment counts for each blog
    const blogsWithComments = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({
          blogId: blog._id,
          status: "approved", // Only count approved comments for public view
        });

        return {
          ...blog.toObject(),
          commentCount,
        };
      })
    );

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs: blogsWithComments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching public blog posts:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single blog post
const getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const blog = await postModel.findById(postId).populate("author", "name");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Increment blog post views (for tracking views from frontend)
const incrementBlogViews = async (req, res) => {
  try {
    const { postId } = req.params;

    const blog = await postModel.findById(postId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      views: blog.views,
    });
  } catch (error) {
    console.error("Error incrementing blog views:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update blog post
const updateBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, excerpt, tags, status, featured } = req.body;

    const blog = await postModel.findById(postId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    if (
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this blog post",
      });
    }

    const updateData = {
      title,
      content,
      excerpt,
      status: status || blog.status,
      featured: featured === "true" || featured === true,
    };

    if (tags) {
      updateData.tags = Array.isArray(tags)
        ? tags.map((tag) => tag.trim()).filter((tag) => tag)
        : tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
    }

    if (req.file) {
      if (blog.image && blog.image !== "default-blog.jpg") {
        try {
          fs.unlinkSync(path.join(__dirname, "../uploads", blog.image));
        } catch (error) {
          console.log("Error deleting old image:", error.message);
        }
      }
      updateData.image = req.file.filename;
    }

    const updatedBlog = await postModel
      .findByIdAndUpdate(postId, updateData, { new: true, runValidators: true })
      .populate("author", "name userName profilePic");

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete blog post
const deleteBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const blog = await postModel.findById(postId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    if (
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this blog post",
      });
    }
    if (req.file) {
      if (blog.image && blog.image !== "default-blog.jpg") {
        try {
          fs.unlinkSync(path.join(__dirname, "../uploads", blog.image));
        } catch (error) {
          console.log("Error deleting old image:", error.message);
        }
      }
      updateData.image = req.file.filename;
    }

    await postModel.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleBlogStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;

    const blog = await postModel.findById(postId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Check if admin is the author
    if (
      blog.author.toString() !== req.user._id &&
      (blog.author.toString() !== req.user.role) === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own blog posts",
      });
    }

    blog.status = status;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog post status updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error toggling blog status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get blog statistics
// Publish all draft posts (for testing)
const publishAllDrafts = async (req, res) => {
  try {
    const result = await postModel.updateMany(
      { status: "Draft" },
      { status: "Published" }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} draft posts published`,
    });
  } catch (error) {
    console.error("Error publishing drafts:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlogStats = async (req, res) => {
  try {
    const totalPosts = await postModel.countDocuments({ author: req.user._id });
    const publishedPosts = await postModel.countDocuments({
      author: req.user._id,
      status: "Published",
    });
    const draftPosts = await postModel.countDocuments({
      author: req.user._id,
      status: "Draft",
    });
    const totalViews = await postModel.aggregate([
      { $match: { author: req.user._id } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    // Get total comments
    const userBlogs = await postModel
      .find({ author: req.user._id })
      .select("_id");
    const blogIds = userBlogs.map((blog) => blog._id);
    const totalComments = await Comment.countDocuments({
      blogId: { $in: blogIds },
      status: "approved",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews[0]?.totalViews || 0,
        totalComments,
      },
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllBlogPosts,
  getPublicPosts,
  getSinglePost,
  incrementBlogViews,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogStatus,
  publishAllDrafts,
  getBlogStats,
};
