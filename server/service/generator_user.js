var db = require('../helper/db');
var role =require('../helper/role');
const bcrypt = require('bcryptjs');

var User = db.User;
var Class= db.User;
var user_list=[
    {
        "username": "Thuc",
        "gmail": "1613494@hcmut.edu.vn",
        "mssv":"1613494",
        "hash": "123456",
        "fullname": "Huynh Cong Thuc",
        "phone": "1613494",
        "khoa":"Computer Science",
        "nien_khoa":2016
    },
    {
        "username": "Danh",
        "gmail": "1610391@hcmut.edu.vn",
        "mssv":"1610391",
        "hash": "123456",
        "fullname": "Nguyen Hoai Danh",
        "phone": "1610391",
        "khoa":"Computer Science",
        "nien_khoa":2016
    },
    {
        "username": "Chi",
        "gmail": "1610304@hcmut.edu.vn",
        "mssv":"1610304",
        "hash": "123456",
        "fullname": "Luong Thien Chi",
        "phone": "1610304",
        "khoa":"Computer Science",
        "nien_khoa":2016
    },
    {
        "username": "Student",
        "gmail": "huynhthuc001@gmail.com",
        "mssv":"88888888",
        "hash": "123456",
        "fullname": "Student",
        "phone": "88888888",
        "khoa":"Computer Science",
        "nien_khoa":2016
    },
    {
        "username": "Teachera",
        "gmail": "teacher@gmail.com",
        "mssv":"1610506",
        "hash": "123456",
        "fullname": "Teacher",
        "phone": "1610506",
        "khoa":"Computer Science",
        "nien_khoa":2016
    },
    {
        "username": "Luu Quang Huan",
        "gmail": "huanlq@hcmut.edu.vn",
        "mssv":"99999999",
        "hash": "123456",
        "fullname": "Luu Quang Huan",
        "phone": "99999999",
        "khoa":"Computer Science",
        "nien_khoa":2016
    }
];

async function init(){
    for(var index = 0;index<user_list.length;index++){
        var user = new User(user_list[index]);
        if(index<4){
            user.role=role.Student;
        }else{
            user.role=role.Teacher;
        }
        user.hash=bcrypt.hashSync(user_list[index].hash, 10);
        user.createDate=Date.now();
        await user.save();
    }
    return {message:"Khởi tạo user thành công",object:""}
   
}
module.exports={
    init
}