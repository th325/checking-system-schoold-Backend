const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose);
/**
 * @typedef Session
 * @property {string} room_id.required
 * @property {string} link_face.required - Some description for point - eg: 1234
 * @property {string} user_checkin_id.required
 * @property {string} location.required
 * @property {string} user_create.required
 * @property {string} create_date.required
 */
const schema = new Schema({
  room_id: { type: String, required: true },
  link_face:{type: String,require: true},
  user_checkin_id:{type: String,require: true},
  location: { type: { longtitude: { type: Float }, latitude: { type: Float } }, required: true },
  user_create: { type: String, require: true },
  create_date: { type: Date, default: Date.now },
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model('Session', schema);
