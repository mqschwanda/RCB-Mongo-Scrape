// Dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio'); // now gluten free and with jQuery

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));


// Database configuration with mongoose
mongoose.connect('mongodb://localhost/scrape');
var db = mongoose.connection;
// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});
// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});
// And we bring in our Comment and Article models
var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');


// ROUTER
// HOME PAGE: send index file
app.get('/', function (req, res) {
  res.send(index.html);
});
// scrape articles for the database
app.get('/scrape', function(req, res){
  // grab the body of the html with request
  request('http://www.nj.com/news/', function(error, response, html) {
    // then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $('#river-container>ul>li').each(function(i, element) {
        // create new article using cheerio to fill the article object's title and href
        var scrapedArticle = new Article ({ // add the text and href of every link
          title: $(this).children('.item-text').children('.h2.fullheadline').children('a').text(),
          href: $(this).children('.item-text').children('.h2.fullheadline').children('a').attr('href')
        });
        // save the scraped article to the db
        scrapedArticle.save(function(err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log(doc);
          }
        }).then(function() {
          res.redirect('/articles');
        });
    });
  });
});
// get scraped articles from database
app.get('/articles', function(req, res){
  // grab every doc in the Articles array
  Article.find({}, function(err, doc){
    if (err){
      console.log(err);
    } else { //send the doc to the browser as a json object
      res.json(doc);
    }
  });
});
// grab an article by it's ObjectId and return
app.get('/articles/:id', function(req, res) {
  // using the id passed in the id parameter,
  Article.findOne({'_id': req.params.id})
  .populate('comment') // and populate all of the notes associated with it.
  .exec(function(err, doc) { // now, execute our query
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});
// post comment to article and make it the only comment associated (1:1)
app.post('/articles/:id', function(req, res) {
  // create a new commment and pass the req.body as the attributes.
  var newComment = new Comment(req.body);
  // and save the new comment the db
  newComment.save(function(err, doc) {
    if (err) {
      console.log(err);
    } else { // prepare a query that finds the matching Article in our db
      Article.findOneAndUpdate(
        { // use the Article id passed in the id parameter from the url
          '_id': req.params.id
        },{ // and update the comment attribute to have a 1:1 relationship a comment
          'comment':doc._id
        }).exec(function(err, doc) { // execute query
        if (err) {
          console.log(err);
        } else {
          res.send(doc);
        }
      });
    }
  });
});


// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
