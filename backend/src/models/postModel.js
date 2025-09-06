const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: string,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    default: "",
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: [{ type: String }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  like: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
  published: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Post", postSchema);
