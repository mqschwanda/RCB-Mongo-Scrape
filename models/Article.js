var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Schema class
module.exports = mongoose.model('Article', new Schema({ // Create Article model
  title: { // title from news article
    type:String,
    required:true
  },
  href: { // link to send people to article webpage
    type: String,
    required: true
  },
  comment: { // Article has many comments (One->Many)
      type: Schema.Types.ObjectId, // reference Comment model
      ref: 'Comment'
  }
}));
