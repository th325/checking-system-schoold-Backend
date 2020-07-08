var nodemailer = require('nodemailer');
var db = require('./../helper/db')
var User = db.User;
var Token = db.Token;
var propertiesReader = require('properties-reader');
var properties = process.env.ENV_NODE=="staging"?propertiesReader('./properties.staging.file'):process.env.ENV_NODE=="product"?propertiesReader('./properties.product.file'):propertiesReader('./properties.dev.file');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: properties.get('gmail.username'),
    pass: properties.get('gmail.password')
  }
});
module.exports ={
    send
}
async function send(mailOptions){
    transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
          console.log(error);
          throw({code:500,message:"Lỗi server mail"})
        } else {
          await token.save();
          console.log('Email sent: ' + info.response);
          return;        
        }
      });
}
