const express = require('express');
const router = express.Router();
const roomService = require('../service/room.service');
const sessionService = require('../service/session.service');
var url = require('url');

const authorize = require('../helper/authorize');
const role = require('../helper/role');

module.exports = router;


router.post('/',authorize(role.Teacher),createRoom);
router.put('/',authorize(role.Teacher), updateRoom);
router.delete('/',authorize(role.Teacher), closeRoom);
router.get('/:id', getOneRoom);
router.get('/classes/:id',getAllRoomOfClass)
router.post('/authorize/',checkSecret)
router.get('/:id/students',getAllStudentOfRoom)
/**
 * @typedef Response_new_room
 * @property {string} message
 * @property {Room.model} object
 */
/**
 * Create room
 * @route POST /rooms/
 * @group Room - API create room
 * @returns {Response_new_room.model} 200 - Information Room
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function createRoom(req, res, next){
    roomService.create(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
/**
 * Close room
 * @route DELETE /rooms/
 * @group Room - API close room
 * @returns {Response_new_room.model} 200 - Information Room
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function closeRoom(req,res,next){
    console.log("close room");
    roomService.close(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
function updateRoom(req,res,next){
    roomService.update(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
/**
 * get a room
 * @route GET /rooms/:id
 * @group Room - API get room
 * @returns {Response_new_room.model} 200 - Information Room
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function getOneRoom(req,res,next){
    // console.log(url.parse(req.url).pathname.split('/')[1]);
    roomService.getById(url.parse(req.url).pathname.split('/')[1])
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
/**
 * get all student of a room
 * @route GET /rooms/:id/students
 * @group Room - API check password
 * @returns {Error_401.model} 401 - Invalid Token
 * @returns {Error_400.model} 400 - Bad body
 * @security JWT
 */
function getAllStudentOfRoom(req,res,next){
    sessionService.getAllStudentInRoom(req,res)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
/**
 * check password room 
 * @route POST /rooms/authorize
 * @group Room - API check password
 * @returns {Error_401.model} 401 - Invalid Token
 * @returns {Error_400.model} 401 - Bad body
 * @security JWT
 */
function checkSecret(req,res,next){
    roomService.isPassRoom(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
/**
 * @typedef Response_room_class
 * @property {string} message
 * @property {Array.<Room>} object
 */
/**
 * get all room a class
 * @route GET /rooms/classes/:id'
 * @group Room - API get rooms a class
 * @returns {Response_room_class.model} 200 - Information Room
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function getAllRoomOfClass(req,res,next){
    roomService.getAll(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}