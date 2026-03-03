const mongoose = require('mongoose');

const Book = new mongoose.Schema({
  name : {type : String, required : true},
  title : {type : String, required : true}
});


const author = new mongoose.Schema({
  name : {type : String, required : true, minlength : 3, maxlegth : 40},
  Book1 : [Book]
},{timestamps : true});

const modelAuthor = mongoose.model('modelAuthor',author)

module.exports = modelAuthor;