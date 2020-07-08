const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helper/db');
const { ObjectId } = require('mongodb');
const role=require('../helper/role')
const Class = db.Class;
const User = db.User;
module.exports = {
  getById,
  create,
  updateSecret,
  updateManyClassForUser,
  updateClassForManyUsers,
  getAllRoleTeacher,
  getAllRoleStudent,
};

async function getAllRoleTeacher(req) {
  return  { object:await Class.find({ teacher_id: req.params.id}),message: 'Thông tin tất cả lớp học' };
}
async function getAllRoleStudent(req) {
  const user = await User.findOne({ _id: req.params.id });
  if (!user)  throw { code:404,message: 'Không tìm thấy sinh viên' };;
  var list_class = [];
  for (let i = 0; i < user.class_ids.length; i++) {
    const class_object = await Class.findOne({ _id: user.class_ids[i]});
    if (!class_object) throw {message:"Không tìm thấy lớp học",code:404}
    const teacher = await User.findOne({ _id: class_object.teacher_id });
    list_class.push({class:class_object,teacher:teacher});
  }
  console.log(list_class);
  return { object:list_class,message: 'Thông tin tất cả lớp học' };
}
async function getById(id) {
  return {message:"Thông tin chi tiết lớp học",object:await Class.findById(id)};
}

async function create(req, res) {
  // validate
  console.log(req.body.code_subject);

  if (await Class.findOne({ code_subject: req.body.code_subject, code_class: req.body.code_class, semester: req.body.semester })) {
    throw  { code:400,message: 'Thông tin về lớp học đã tồn tại' };
  }
  var user = await User.findOne({_id:req.body.teacher_id});
  if (!user) {
    console.log(404);
    throw { code:404,message: 'Không tìm thấy giảng viên' };
  }
  const class_object = new Class(req.body);
  // hash password
  class_object.user_create = req.user.sub;
  class_object.secret = bcrypt.hashSync(req.body.secret, 10);
  // save user
  return {object:await class_object.save(),message:"Tạo lớp học thành công"};
}

async function updateSecret(req) {
  
  if (!req.body.user_pass||!req.body.class_id) throw {message:"Vui lòng nhập đầy đủ thông tin"}
  var class_object = await Class.findById(req.body.class_id);
  if (!class_object) throw { code:404,message: 'Không tìm thấy lớp học' };
  var user = await User.findById(req.user.sub);

  // validate
  
  // hash password if it was entered
  
  if(!(user._id==class_object.teacher_id))throw { code:400,message: 'Không có quyền chỉnh sửa lớp học' };
  
  if (!bcrypt.compareSync(req.body.user_pass,user.hash)) throw {code:400,message:"Xác thực không thành công"}
  if(req.body.secret)
    class_object.secret = bcrypt.hashSync(req.body.secret, 10);
  if(req.body.name_subject)
    class_object.name_subject=req.body.name_subject;
  if(req.body.code_subject)
    class_object.code_subject=req.body.code_subject;
  if(req.body.number_of_student)
    class_object.number_of_student=req.body.number_of_student;
  if(req.body.code_class)
    class_object.code_class=req.body.code_class;
  if(req.body.teacher_id){
    if(req.user.role==role.Admin){
      var teacher = await User.findById(req.body.teacher_id);
      if(!teacher)
        throw { code:404,message: 'Không tìm thấy giảng viên' };
        class_object.teacher_id=req.body.teacher_id;
    }else{
        throw { code:404,message: 'Không có quyền chỉnh sửa teacher_id trên tài khoản giảng viên' };
    }
    
  }
  // copy userParam properties to user
  // Object.assign(user, userParam);
  return {message:"Cập nhật thành công",object:await class_object.save()};
}

async function updateManyClassForUser(req) {
  const user = await User.findById(req.user.sub);
  if (!user) throw { code:404,message: 'Không tìm thấy sinh viên' };;
  var list_class = req.body.map((element) => element.class_id);
  console.log(list_class);
  var newArray = user.class_ids;

  newArray = [].concat(newArray, list_class);
  console.log(newArray);
  user.class_ids = [...new Set(newArray)];
  return {message:"Cập nhật thành công lớp học cho sinh viên",object:await user.save()};
}
async function updateClassForManyUsers(req, res) {
  var list_undifine_user = [];
  var list_user = req.body.users;
  var class_object = await Class.findOne({_id:req.body.class_id});
  if (!class_object) {
    throw { code:404,message: 'Không tìm thấy lớp học' };
  } else {
    for (var stu in list_user) {
      var user = await User.findOne({ mssv: list_user[stu] });
      if (!user) {
        list_undifine_user.push(list_user[stu]);
      } else {
        if(user.class_ids.length!=0&&!user.class_ids.includes(req.body.class_id))throw {message:"Sinh viên "+user.mssv+" đã được thêm trước đó",code:400};
        user.class_ids = [...new Set([].concat([class_object._id], user.class_ids))];
        await user.save();
      }
    }
    return {message:"Thông tin cập nhật lớp học", object: {list_unupdate_user:list_undifine_user}};
  }
}
