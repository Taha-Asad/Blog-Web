const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
});

module.exports = mongoose.model("Tag", tagSchema);
