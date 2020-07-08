const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const role = require('../helper/role');
/**
 * @typedef User
 * @property {string} username.required
 * @property {string} avatar_link.required - Some description for point - eg: 1234
 * @property {string} avatar_link
 * @property {string} gmail.required
 * @property {string} mssv.required
 * @property {string} password.required
 * @property {string} fullname.required
 * @property {string} khoa.required
 * @property {number} nien_khoa.required
 * @property {string} address.required
 * @property {string} male.required
 */

const schema = new Schema({
  username: { type: String, unique: true, required: true },
  avatar_link: { type: String },
  gmail: { type: String, unique: true, required: true },
  mssv: { type: Number, unique: true, required: true },
  hash: { type: String, required: true },
  fullname: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  khoa: { type: String},
  nien_khoa: { type: String},
  address: { type: String },
  role: { type: role, require: true },
  class_ids: { type: [] },
  male: { type: Boolean, default: true },
  create_date: { type: Date, default: Date.now },
  list_images: { type: [] },
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model('User', schema);
