const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  // id:{type: String},
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: { type: [String], required: true },
  imageUrl: { type: String, required: true },
  tags: { type: [String], required: true },
  githubUrl: { type: String },
});

module.exports = mongoose.model("Project", projectSchema);
