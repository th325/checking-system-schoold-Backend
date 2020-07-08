//TensorFlow.js is an open-source hardware-accelerated JavaScript library
//for training and deploying machine learning models.
const tf = require('@tensorflow/tfjs');
const automl = require('@tensorflow/tfjs-automl');
const express = require('express');
const router = express.Router();
var multer = require('multer');
const { extract_faces } = require('./detect-face');
const { v4: uuidv4 } = require('uuid');
const db = require('../helper/db');
var compress_images = require('compress-images');

const User = db.User;
const Config = db.Config;
//MobileNet : pre-trained model for TensorFlow.js
//The module provides native TensorFlow execution
//in backend JavaScript applications under the Node.js runtime.
const tfnode = require('@tensorflow/tfjs-node');
var propertiesReader = require('properties-reader');
var properties = process.env.ENV_NODE=="staging"?propertiesReader('./properties.staging.file'):process.env.ENV_NODE=="product"?propertiesReader('./properties.product.file'):propertiesReader('./properties.dev.file');
// const automl = require('@tensorflow/tfjs-automl');
//The fs module provides an API for interacting with the file system.
module.exports = {
  uploadFile,
};
const fs = require('fs');
const model_url = properties.get('server.host.name') + ':' + properties.get('server.host.port') + '/models';
// const model_url = "http://localhost:9000/test";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/store/checkin');
  },
  filename: async function (req, file, cb) {
    let file_new_name = req.user.sub + '-' + uuidv4() + '-' + Date.now() + '.' + file.originalname.split('.').pop();
    console.log(file.originalname);
    cb(null, file_new_name);
    //check type avatar
  },
});
var upload = multer({ storage: storage }).single('image');

const readImage = (path) => {
  //reads the entire contents of a file.
  //readFileSync() is synchronous and blocks execution until finished.
  const imageBuffer = fs.readFileSync(path);
  //Given the encoded bytes of an image,
  //it returns a 3D or 4D tensor of the decoded image. Supports BMP, GIF, JPEG and PNG formats.
  const tfimage = tfnode.node.decodeImage(imageBuffer);
  return tfimage;
};
async function uploadFile(req, res) {
  await upload(req, res, async function (err) {
    if (!req.file) {
      res.status(400);
      res.send({ message: 'Lỗi upload file' });
    }
    const fileInput = './public/store/checkin/' + req.file.filename;
    const path_out = './public/store/output/';
    var { faces, hightLightFace, list_face_url } = await extract_faces(fileInput, path_out);
    console.log("completed extract_faces");
    /// TO DO
    // for list_face_url;
    let predict = [];
    console.log(list_face_url.length);
    console.log("detect a face");
    for (let url of list_face_url) {
      console.log("file anh"+url);
      rs = await imageClassification(url);
      console.log(rs);
      const max_label = rs.sort((x, y) => -x.prob + y.prob)[0];
      if(!predict.find((e)=>e.label==max_label.label)){
        predict.push(max_label);
      }else{
        var object = predict.find((e)=>e.label==max_label.label);
        var index = predict.findIndex((e)=>e.label==max_label.label);
        if(object.prob<max_label.prob){
          predict[index]=max_label;
        }
      }
        
      console.log(rs.sort((x, y) => -x.prob + y.prob)[0])
      // predict = predict.concat(rs);
      // console.log(predict);
    }
    console.log("for looped")
    // return;
    // end TO DO
    console.log(predict);
    var setting_sv = await Config.findOne({label:"predict"});
    var value=0.0;
    if(!setting_sv){
      value=0.6;
    }else value=setting_sv.value;
    console.log("value predict large than "+value);
    predict = predict.sort((x, y) => -x.prob + y.prob).filter((x) => x.label != 'None');
    predict = predict.filter((x) => {
      console.log(x.prob >= value);
      return x.prob >= value;
    });
    console.log(predict);
    for (let ind = 0; ind < predict.length; ind++) {
      var user = await User.findOne({ mssv: predict[ind].label.split('_').pop() });
      if (user) predict[ind].label = user;
    }
    // console.log(predict);
    const filecompress = './public/store/output/compress/';
    compress_images(hightLightFace, filecompress, {compress_force: false, statistic: true, autoupdate: true}, false,
      {jpg: {engine: 'mozjpeg', command: ['-quality', '15']}},
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
          fs.unlinkSync(hightLightFace);
        }catch(err){
          console.log(err);
        }
        
      }                                 
      });
    res.status(200);
    res.send({ result: { predict, out_image: (filecompress+hightLightFace.split('/').pop()).replace('./public', ''), num_faces: faces.length } });
  });
}
async function imageClassification(path) {
  const image = readImage(path);
  // Load the model.
  console.log('model loading...');
  const model = await automl.loadImageClassification(model_url);
  console.log('model loaded');
  const predictions = await model.classify(image);
  return predictions;
}
