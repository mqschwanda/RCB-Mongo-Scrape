// var express = require('express');
// var router = express.Router();
// Automatically update copyright
var moment = require('moment');
var copyrightYear = moment().get('year');

module.exports = function (router) {

	// HOME PAGE: send index file
	router.get('/', function (req, res) {
		res.send(index.html);
	});
  // scrape articles for the database
  router.get('/scrape', function(req, res){
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
              res.json(doc);
            }
          });
      });
    });
  });
  // get scraped articles from database
  router.get('/articles', function(req, res){
    // grab every doc in the Articles array
    Article.find({}, function(err, doc){
      if (err){
        console.log(err);
      } else { //send the doc to the browser as a json object
        res.json(doc);
      }
    });
  });
  // grab an article by it's ObjectId
  router.get('/articles/:id', function(req, res) {
    // using the id passed in the id parameter,
    Article.findOne({'_id': req.params.id})
    .populate('note') // and populate all of the notes associated with it.
    .exec(function(err, doc) { // now, execute our query
      if (err) {
        console.log(err);
      } else {
        res.json(doc);
      }
    });
  });
  // post comment to article and make it the only comment associated (1:1)
  router.post('/articles/:id', function(req, res) {
  	// create a new commment and pass the req.body as the attributes.
  	var newComment = new Comment(req.body);
    // and save the new note the db
  	newComment.save(function(err, doc) {
  		if (err) {
  			console.log(err);
  		} else { // prepare a query that finds the matching Article in our db
  			Article.findOneAndUpdate(
          { // use the Article id passed in the id parameter from the url
            '_id': req.params.id
          },{ // and update the note attribute to have a 1:1 relationship a comment
            'note':doc._id
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

};
