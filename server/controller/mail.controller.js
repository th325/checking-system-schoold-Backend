const express = require('express');
const router = express.Router();
const mailService = require('../service/mail.service');
const role = require('../helper/role');

module.exports = router;

router.post('/forget', sendmail);

async function sendmail(req,res,next){
    mailService.send(req,req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}