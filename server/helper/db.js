const mongoose = require('mongoose');
var propertiesReader = require('properties-reader');
var properties = process.env.ENV_NODE=="staging"?propertiesReader('./properties.staging.file'):process.env.ENV_NODE=="product"?propertiesReader('./properties.product.file'):propertiesReader('./properties.dev.file');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(properties.get("mongodb.host.name") || properties.get("mongodb.host.name") , connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../model/user'),
    Class:require('../model/class'),
    Room:require('../model/room'),
    Session:require('../model/session'),
    Token:require('../model/token'),
    Config:require('../model/config'),
};
