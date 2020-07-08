const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
const Schema = mongoose.Schema;
const schema = new Schema({
    label:{ type: String, required: true,unique:true },
    value: { type: Float, required: true },
  });
schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  
  module.exports = mongoose.model('Config', schema);