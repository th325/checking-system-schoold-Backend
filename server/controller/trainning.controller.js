const express = require('express');
const router = express.Router();
const trainingService = require('../service/training.service')
module.exports = router;
router.post('/',classifyImage);
async function classifyImage(req,res,next){
    trainingService.uploadFileModel(req,res);
  
}