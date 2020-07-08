const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helper/db');
const role = require('../helper/role');
const utils = require('../utils/string');
path = require('path');
var compress_images = require('compress-images');
const { v4: uuidv4 } = require('uuid');
var mailService = require('./mail.service');
var multer = require('multer');
var dirmain = path.join(__dirname, '../');
var propertiesReader = require('properties-reader');
var properties = process.env.ENV_NODE=="staging"?propertiesReader('./properties.staging.file'):process.env.ENV_NODE=="product"?propertiesReader('./properties.product.file'):propertiesReader('./properties.dev.file');
const User = db.User;
const Token = db.Token;
module.exports = {
  authenticate,
  getAll,
  getById,
  createStudent,
  createTeacher,
  createAdmin,
  update,
  updatePassword,
  updateAvatar,
  getSelf,
  changePassword,
  checkOTP,
  resetPasswordAccount
};
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dirmain + 'public/store/avatar');
  },
  filename: async function (req, file, cb) {
    let file_new_name = req.user.sub + '-'+uuidv4() +'-'+ Date.now()+'.'+file.originalname.split('.').pop();
    console.log(file_new_name)
    cb(null, file_new_name);

    //check type avatar
  },
});
var upload = multer({ storage: storage }).single("image");

async function authenticate({ username, password }) {
  let user = await User.findOne({ phone: username });
  if (!user) {
    user = await User.findOne({ gmail: username })
    if(!user)
      user = await User.findOne({ mssv: username })
  };
  console.log(132, user);
  if(!user)throw {code:400,message:"username hoặc password sai"};
  var label = utils.removeAccents(user.fullname.split(' ')[user.fullname.split(' ').length - 1]) + '_' + user.mssv;
  if (user && bcrypt.compareSync(password, user.hash)) {
    console.log(properties.get("server.host.secret").toString());
    const token = jwt.sign(
      { sub: user.id, username: user.fullname, mssv: user.mssv, role: user.role, label: label, link_avatar: user.link_avatar },
      properties.get("server.host.secret").toString()
    );
    return {message:"Đăng nhập thành công",object:{
      ...user.toJSON(),
      token,
    }};
  }else{
    throw {code:400,message:"username hoặc password sai"};
  }
}
async function getAll() {
  return await User.find();
}

async function getById(id) {
  var user = await User.findById(id);
  if(user){
    return {message:"Thông tin cá nhân",object:user};
  }
  throw {code:404,message:"Không tìm thấy user"} 
}
async function getSelf(req) {
  var user = await User.findById(req.user.sub);
  if(user){
    return {message:"Thông tin cá nhân",object:user};
  }
  throw {code:404,message:"Không tìm thấy user"} 
}

async function createStudent(userParam) {
  // validate
  // if (await User.findOne({ username: userParam.username })) {
  //   throw 'Tên đăng nhập đã được sử dụng';
  // }
  if (await User.findOne({ phone: userParam.phone })) {
    throw {code:400,message:'Số điện thoại đã được sử dụng'};
  }
  if (await User.findOne({ gmail: userParam.gmail })) {
    throw {code:400,message:'Địa chỉ email đã được sử dụng'};
  }
  if (await User.findOne({ mssv: userParam.mssv })) {
    throw {code:400,message:'Mssv đã được sử dụng'};
  }
  userParam.role = role.Student;
  const user = new User(userParam);
  user.avatar_link = '5ed9e6f4ea0271b177435352-1591368306749.jpg';
  // hash password
  user.hash = bcrypt.hashSync(userParam.hash, 10);
  // save user
  return  { object:await user.save(),message: 'Tạo người dùng thành công' };
}
async function createAdmin(userParam) {
  // validate
  // if (await User.findOne({ username: userParam.username })) {
  //   throw 'Tên đăng nhập đã được sử dụng';
  // }
  var user = new User();
  user.gmail='admin';
  user.hash=bcrypt.hashSync("123456", 10);
  user.role=role.Admin;
  // save user
  return  { object:await user.save(),message: 'Tạo người dùng thành công' };
}
async function createTeacher(userParam) {
  // validate
  console.log(userParam.username);

  if (await User.findOne({ phone: userParam.phone })) {
    throw {code:400,message:'Số điện thoại đã được sử dụng'};
  }
  if (await User.findOne({ gmail: userParam.gmail })) {
    throw {code:400,message:'Địa chỉ email đã được sử dụng'};
  }
  if (await User.findOne({ mssv: userParam.mssv })) {
    throw {code:400,message:'MSVC đã được sử dụng'};
  }
  console.log('username not find-create');
  userParam.role = role.Teacher;
  const user = new User(userParam);
  user.link_avatar = '5ed9e6f4ea0271b177435352-1591368306749.jpg';

  // hash password

  user.hash = bcrypt.hashSync(userParam.hash, 10);
  // save user
  return  { object:await user.save(),message: 'Tạo người dùng thành công' };
}
async function update(user_param) {
  const user = await User.findById(user_param.id);
  var user_clone = user;
  // validate
  if (!user) throw {code:404,message:'Không tìm thấy user'};
  Object.assign(user, userParam);
  user.hash = user_clone.hash;
  user.gmail = user_clone.gmail;
  user.mssv = user_clone.mssv;
  user.username = user_clone.username;
  user.role = user_clone.role;
  user.class_ids = user_clone.class_ids;
  user.list_images = user_clone.list_images;
  // hash password if it was entered

  // copy userParam properties to user
  return {message:"Cập nhật thông tin thành công",object:await user.save()};
}
async function updateAvatar(req, res) {
  var user = await User.findById(req.user.sub);
  if (!user) {
    res.status(404);
    res.send({message:'Không tìm thấy user'});
  }else{
    upload(req, res, async function (err) {
    if(!req.file){
      res.status(400);
      res.send({message:'Chọn file upload'});
    }
    var filename = req.file.filename;
    compress_images('./public/store/avatar/'+filename, './public/store/avatar/compress/', {compress_force: false, statistic: true, autoupdate: true}, false,
        {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
        {png: {engine: 'pngquant', command: ['--quality=20-50']}},
        {svg: {engine: false, command: false}},
        {gif: {engine: false, command: false}},function(error, completed, statistic){
        
        console.log('-------------');
        console.log(error);
        console.log(completed);
        console.log(statistic);
        console.log('-------------');  
        if(completed){
          try{
            // console.log('./public/store/faces/'+filenames[ind])
            // fs.unlinkSync('./public/store/faces/'+filenames[ind]);
          }catch(err){
            console.log(err);
          }
          
        }                                 
      });
   
    user.avatar_link="/store/avatar/compress/"+filename;
    await user.save();
    res.status(200);
    res.send({message:'Đổi avatar thành công',object:user.avatar_link});
    });
  }
}
async function updatePassword(req) {
  const user = await User.findById(req.user.sub);
  if (!user) throw {code:404,message:'Không tìm thấy user'};
  if (bcrypt.compareSync(req.body.old_password, user.hash)) {
    user.hash = bcrypt.hashSync(req.body.new_password, 10);
  }
  await user.save();
  return {message:'Đổi mật khẩu thành công',object:""};
}
async function changePassword(req) {
  const user = await User.findOne({gmail:req.body.gmail});
  if (!user) throw {code:404,message:'Không tìm thấy user'};
  var token = await Token.findOne({gmail:req.body.gmail,code:req.body.token});
  if(!token)throw{code:404,message:"Token không khả dụng"};
  if((Date.now()-token.create_date)>5*60*1000)throw{code:400,message:"Hết hạn đổi mật khẩu"};
  if(token.isUsed)throw{code:400,message:"Token đã được sử dụng"};
  token.isUsed=true;
  user.hash = bcrypt.hashSync(req.body.new_password, 10);
  await user.save();
  await token.save();
  return {message:'Đổi mật khẩu thành công',object:""};
}
async function checkOTP(req){
  const user = await User.findOne({gmail:req.body.gmail});
  if (!user) throw {code:404,message:'Không tìm thấy user'};
  var token = await Token.findOne({gmail:req.body.gmail,code:req.body.token});
  if(!token)throw{code:404,message:"Phiên không được tìm thấy"};
  if((Date.now()-token.create_date)>5*60*1000)throw{code:400,message:"Hết hạn đổi mật khẩu"};
  if(token.isUsed)throw{code:400,message:"Token đã được sử dụng"};
  return {message:"Xác thực thành công",object:""}
}
async function resetPasswordAccount(req){
  const user = await User.findOne({gmail:req.body.gmail});
  if (!user) throw {code:404,message:'Không tìm thấy user'};
  var token  = new Token();
    token.gmail=req.body.gmail;
    token.code=Math.floor(100000 + Math.random() * 900000).toString();
    console.log("token created");
  
  var mailOptions = {
    from: properties.get('gmail.username'),
    to: req.body.gmail,
    subject: 'BK Face: Khôi phục mật khẩu',
    text: 'Chúng tôi nhận được yêu cầu khôi phục mật khẩu, nếu là bạn vui lòng nhập mã xác thực để hoàn thành\n'+
    'Đây là mã xác thực: '+token.code+'\n'+
    'Chúc bạn một ngày tốt lành \nĐội ngũ BK Face'
  };
  await token.save();
  mailService.send(mailOptions);
  return {message:"Xác thực thành công",object:""}
}