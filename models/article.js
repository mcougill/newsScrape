var mongoose = require("mongoose");

//save reference to Schema constructor
var Schema = mongoose.Schema;

//create new ArticleSchema object
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required:true
    },

    comments: {
        type: Schema.Types.ObjectId,
        ref: "Comments"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;