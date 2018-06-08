var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var MongoClient =require("mongodb").MongoClient;
var assert = require("assert");
require('dotenv').config();

//scraping tools
var request = require("request");
var cheerio = require("cheerio");

var Comments = require("./models/Comments.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

//Initialize Express
var app = express();


// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
var public = require("path").join(__dirname,"/public");
app.use(express.static("public"));


app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/newsscraper");
var db = mongoose.connection;

db.on("error", function (error) {
    console.log("Mongoose Error: ", error);
})

db.once("open", function () {
    console.log("Mongoose connected.");
});

//ROUTES

//render handlebars pages
app.get("/", function (req, res) {
    Article.find({ "saved": false }, function (error, data) {
        var hbsObj = {
            article: data
        };
        res.render("home", hbsObj);
    })
});

app.get("/saved", function (req, res) {
    Article.find({
        "saved": true
    })
        .populate("comments")
        .exec(function (error, articles) {
            var hbsObj = {
                article: articles
            };
            res.render("saved", hbsObj);
        });
});


//scrape T&L website
app.get("/scrape", function (req, res) {

    // grab the body of the html with request
    request("http://www.travelandleisure.com/", function (error, response, html) {

        var $ = cheerio.load(html);

        $("li[class=margin-8-tb]").each(function (i, element) {
            var result = {};
            

            result.title = $(this).children("a").text();
            result.link = "www.travelandleisure.com"+$(this).children("a").attr("href");

            var entry = new Article(result);

            //save to db
            entry.save(function (err, doc) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(doc);
                }
            });
        });
        res.send("Scrape Complete");
    });
});


//get articles from MongoDB
app.get("/articles", function (req, res) {

    Article.find({}, function (error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            (res.json(doc));
        }
    });
});

//get article by ID
app.get("/articles/:id", function (req, res) {
    Article.findOne({
        "_id": req.params.id
    })
        .populate("comments")
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(doc);
            }
        });
});

//save article 
app.post("/articles/save/:id", function (req, res) {
    Article.findOneAndUpdate({
        "_id": req.params.id
    }, {
            "saved": true
        })
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                res.send(doc);
            }
        });
});

//delete article
app.post("/articles/delete/:id", function (req, res) {
    console.log("server.js deleted");
  

    Article.findOneAndUpdate({
        "_id": req.params.id
    }, {
            "saved": false
        }
    )
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.send(doc);
            }
        });
});

//add comments
app.post("/comments/save/:id", function (req, res) {
    console.log("server.js comments");
    var newComments = new Comments({
        body: req.body.text,
        article: req.params.id
    });
    newComments.save(function (error, comments) {
        console.log(comments.body);
        if (error) {
            console.log(error)
        } else {
            Article.findOneAndUpdate({
                "_id": req.params.id
            }, {
                    $push: {
                        "comments": comments
                    }
                })
                .exec(function (err) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send(comments);
                    }
                });
        }
    });
});

//delete comments
app.delete("/comments/delete/:comments_id/:article_id", function (req, res) {
    Comments.findOneAndRemove({
        "_id": req.params.comments_id
    }, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            Article.findOneAndUpdate({
                "_id": req.params.article_id
            }, {
                    $pull: {
                        "comments": req.params.comments_id
                    }
                })
                .exec(function (err) {
                    if (err) {
                        console.log(err);
                        res.send(err)
                    } else {
                        res.send("Comment Deleted");
                    }
                });
        }
    });
});



app.listen(PORT, function () {
    console.log("Running on port " + PORT);
});