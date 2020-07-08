var db = require('../helper/db');
var role = require('../helper/role');
const bcrypt = require('bcryptjs');

var User = db.User;
var Class = db.Class;
var user_list = ["1613494", "1610304", "1610391", "88888888", "1610506", "99999999"];
var class_list = [{
    "name_subject": "Phát triển ứng dụng thiết bị di động",
    "code_subject": "CO3043",
    "secret": "123456",
    "number_of_student": 200,
    "code_class": "L01",
    "hocky": "192",
    "teacher_id": "5ee644ffecd4fb866bbf4737"
},
{
    "name_subject": "Thương mại điện tử",
    "code_subject": "CO3027",
    "secret": "123456",
    "number_of_student": 200,
    "code_class": "L01",
    "hocky": "192",
    "teacher_id": "5ee644ffecd4fb866bbf4737"
},
{
    "name_subject": "Phân tích hệ thống",
    "code_subject": "CO3025",
    "secret": "123456",
    "number_of_student": 200,
    "code_class": "L01",
    "hocky": "192",
    "teacher_id": "5ee644ffecd4fb866bbf4737"
}];
async function init() {
    console.log("initing class")
    for (var index = 0; index < class_list.length; index++) {
        var object = new Class(class_list[index]);
        var admin = await User.findOne({ gmail: "admin@" })
        object.secret = bcrypt.hashSync(class_list[index].secret, 10);
        object.user_create = admin._id;
        object.create_date = Date.now();
        if (index == 0) {
            var user = await User.findOne({ mssv: user_list[5] });
            object.teacher_id = user._id;
        } else {
            var user = await User.findOne({ mssv: user_list[4] });
            object.teacher_id = user._id;
        }
        console.log("class saving.......")
        new_object = await object.save();
        console.log("class saved.......")
        for (var i = 0; i < user_list.length; i++) {
            if (i < 4) {
                var student = await User.findOne({ mssv: user_list[i] });
                console.log(student);
                if (student) {
                    student.class_ids = [...new Set([].concat([new_object._id], user.class_ids))];
                    await student.save();
                } else {
                    console.log(user_list[i].mssv + "not found");
                }
            }
        }

    }
    return {message:"Khởi tạo class thành công",object:""}
}

module.exports={
    init
}