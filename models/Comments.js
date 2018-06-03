var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new CommentsSchema object
var CommentsSchema = new Schema({

  title: String,

  body: String
});

var Comments = mongoose.model("Comments", CommentsSchema);

// Export the Comments model
module.exports = Comments;
