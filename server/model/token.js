const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    gmail: { type: String,required: true },
    code: { type: String,required:true },
    isUsed:{type:Boolean,default: false},
    create_date:{type:Date,default:Date.now}
  });
  module.exports = mongoose.model('Token', schema);
