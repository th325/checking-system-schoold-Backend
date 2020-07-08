const express = require('express');
const router = express.Router();
const classifyService = require('../classify/classify.service')
module.exports = router;
router.post('/',classifyImage);
async function classifyImage(req,res,next){
   classifyService.uploadFile(req,res);
  
}