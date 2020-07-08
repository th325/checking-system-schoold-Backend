const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose);
/**
 * @typedef Room
 * @property {string} class_id.required - name e.g 5135165165165
 * @property {string} title.required - e.g: Room 456
 * @property {string} secret.require - Secret to create room
 * @property {Json} location - {longtitude:20.0, latitude:20}
 * @property {Date} start_time.required e.g: 05-05-2020 08:00
 * @property {Date} end_time.required - e.g: 05-05-2020 10:00
 */
const schema = new Schema({
  class_id: { type: String, required: true },
  title: { type: String, required: true },
  secret: { type: String, required: true },
  number:{type:Number,required:true},
  location: { type: { longtitude: { type: Float }, latitude: { type: Float } } },
  user_create: { type: String },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  isClosed:{type:Boolean,default:false},
  created_date: { type: Date, default: Date.now },
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model('Room', schema);
