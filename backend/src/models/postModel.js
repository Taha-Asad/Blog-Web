const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      maxlength: 200,
    },
    image: {
      type: String,
      default: "default-blog.jpg",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String, trim: true }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Archive"],
      default: "Published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
