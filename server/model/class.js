const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * @typedef Class
 * @property {string} name_subject.required - name e.g Phan tich thiet ke
 * @property {string} code_subject.required - e.g: CO4303
 * @property {string} secret.require - Secret to create room
 * @property {number} number_of_student.required
 * @property {string} code_class.required e.g: L01
 * @property {number} hocky.required - e.g: 161
 * @property {string} teacher_id.required e.g: 59215531356515165
 */
const schema = new Schema({
  name_subject: { type: String, required: true },
  code_subject: { type: String, required: true },
  secret: { type: String, required: true },
  number_of_student: { type: Number, required: true },
  code_class: { type: String, required: true },
  user_create: { type: String ,require:true},
  teacher_id: { type: String, require:true },
  semester: { type: String, require: true },
  createdDate: { type: Date, default: Date.now },
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model('Class', schema);
