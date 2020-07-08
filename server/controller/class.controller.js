const express = require('express');
const router = express.Router();
const classServie = require('../service/class.service');
const authorize = require('../helper/authorize');
const role = require('../helper/role');

module.exports = router;

router.post('/', authorize(role.Admin), createClass);
router.put('/secrets', authorize(role.Teacher), updateSecret);
router.put('/update-class-for-user', authorize(role.Admin), updateClassForUser);
router.delete('/', authorize(role.Admin), removeClass);
router.get('/students/:id', authorize(role.Student), getAllClassOfStudent);

router.get('/:id', getOneClass);
router.get('/teachers/:id', authorize(role.Teacher), getAllClassOfTeacher);
function createClass(req, res, next) {
  classServie
    .create(req,res)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
function updateClassForUser(req, res, next) {
  classServie
    .updateClassForManyUsers(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
function removeClass() {}
function updateSecret(req,res,next) {
  classServie.updateSecret(req)
  .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
function getOneClass(req, res, next) {
  classServie
    .getById(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
function getAllClassOfTeacher(req, res, next) {
  classServie
    .getAllRoleTeacher(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));

}
function getAllClassOfStudent(req, res, next) {
  classServie
    .getAllRoleStudent(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
