const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content required" });
    }

    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user ? req.user._id : null, 
      status: "pending",
    });

    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    res.status(201).json({ success: true, message: "Comment submitted for review", comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const moderateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;  

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true }
    );

    res.status(200).json({ success: true, comment: updatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addComment, moderateComment };
