const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helper/db');
var formidable = require('formidable');
var fs = require('fs');
path = require('path');
const express = require('express');
const User = db.User;
var multer = require('multer');
var dirmain = path.join(__dirname, '../');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const {detectFaces} = require('../classify/detect-face')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var propertiesReader = require('properties-reader');
var properties = process.env.ENV_NODE=="staging"?propertiesReader('./properties.staging.file'):process.env.ENV_NODE=="product"?propertiesReader('./properties.product.file'):propertiesReader('./properties.dev.file');
// var storage = require('@google-cloud/storage');

// Creates a client
// const storageClould = new Storage();
const csvWriter = createCsvWriter({
  append: true,
  path: dirmain + '/dataset/dataset.csv',
  header: [{ id: 'type' }, { id: 'link' }, { id: 'label' }],
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './classify/');
  },
  filename: async function (req, file, cb) {
    console.log(file.originalname)
    cb(null, file.originalname);

    //check type avatar
  },
});
var upload = multer({ storage: storage }).array('file-models', 5);

module.exports = {
    uploadFileModel,
  // updateAvatar
};

async function uploadFileModel(req, res) {
  var name_folder=Date.now();
  listfile_model=["dict.txt","group1-shard1of3.bin","group1-shard2of3.bin","group1-shard3of3.bin","model.json"]
  fs.mkdir('./classify/old/'+name_folder, { recursive: false }, (err) => {
    if (err) throw err;
 });
  for(var ind in listfile_model){
    try{
      await fs.renameSync("./classify/"+listfile_model[ind],'./classify/old/'+name_folder+'/'+listfile_model[ind]);
    }catch(err){

      console.log(err);
      res.status(500);
      res.send({message:"Lỗi chuẩn bị, vui lòng upload model thủ công"+err});
      return;
    }
  }
  await upload(req, res, async function (err) {
    if (err) {
      throw err;
    }
    res.status(200);
    res.send({message:"Upload file trainning hoan thanh",object:""})
  });
}