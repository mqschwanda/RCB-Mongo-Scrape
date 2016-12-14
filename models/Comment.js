var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Schema class
module.exports = mongoose.model('Comment', new Schema({ // Create Comment model
  title: {type: String}, // title for user's comment
  body: {type: String} // main conetent for the comment
}));
