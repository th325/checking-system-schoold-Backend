const express = require('express');
const router = express.Router();
const sessionService = require('../service/session.service');
const authorize = require('../helper/authorize')
const role = require('../helper/role');

module.exports = router;


router.post('/',authorize(role.Student),createSession);
router.get('/checkins',authorize(role.Student),getAllSelfSession);
// router.put('/',authorize(role.Student), updateSession);
// router.delete('/',authorize(role.Teacher), removeSession);
router.get('/:id',authorize(role.Teacher), getOneSession);
// router.get('/rooms/:id',authorize(role.Teacher),getAllSessionInRoom);
/**
 * @typedef Response_checkin
 * @property {string} message
 * @property {Array.<Session>} object
 */
/**
 * Checkin
 * @route POST /session/authorize
 * @group Session - API session user
 * @returns {Response_checkin.model} 200 - Information User
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function createSession(req, res, next){
    console.log("debug create session _1")
    sessionService.create(req)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
// function removeSession(){

// }
// function updateSession(req, res, next){
//     sessionService.update(req,res)
//     .then((result) => res.json(result))
//     .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
// }
/**
 * @typedef Response_session
 * @property {string} message
 * @property {Session.model} object
 */
/**
 * Get session user
 * @route GET /sessions/:id
 * @group Session - API session user
 * @returns {Response_session.model} 200 - Information User
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function getOneSession(req,res,next){
    sessionService.getById(req,res)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}
/**
 * @typedef Response_sessions
 * @property {string} message
 * @property {Array.<Session>} object
 */
/**
 * Get All session of a user
 * @route GET /sessions/checkins
 * @group Session - API session user
 * @returns {Response_sessions.model} 200 - Information User
 * @returns {Error_401.model} 401 - Invalid Token
 * @security JWT
 */
function getAllSelfSession(req,res,next){
    console.log("debug here");
    sessionService.getAllSelf(req,res)
    .then((result) => res.json(result))
    .catch((err) => res.status(err.code==null?500:err.code).send({message:err.message}));
}