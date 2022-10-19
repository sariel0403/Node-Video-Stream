const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadedfilesSchema = new Schema({
  filename: {
    type: String,
  },
  filepath: {
    type: String,
  },
});

module.exports = Uploadedfiles = mongoose.model(
  "uploadedfiles",
  UploadedfilesSchema
);
