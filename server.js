var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

//scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

//Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//Connect to MongoDB
mongoose.connect("mongodb://localhost/newsscraper");

app.get("/", function (req, res) {
    res.send("Hello world");
});


app.get("/scrape", function (req, res) {

    // grab the body of the html with request
    axios.get("http://www.travelandleisure.com/").then(function (response) {

        var $ = cheerio.load(response.data);

        $("li[class=margin-8-tb]").each(function (i, element) {
            var result = {};

            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");


            db.Article.create(result)
                .then(function (dbArticle) {

                    console.log(dbArticle);
                })
                .catch(function (err) {

                    return res.json(err);
                });
        });


        res.send("Scrape Complete");
    });
});

app.listen(PORT, function () {
    console.log("Running on port " + PORT);
});