const mongoose = require('mongoose');

const demoSchem = mongoose.Schema({
  name : {type : String, required : true},
  age : {type : Number, required : true},
  status : {type : String}
})

demoSchem.index({age : 1});

const modelDemo = mongoose.model('DEMO_Model',demoSchem);

module.exports = modelDemo;