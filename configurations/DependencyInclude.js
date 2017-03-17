/*
 * @author Abhimanyu
 * Requirement - include all the global variables and module required by the application
 */
   global.ffmpeg = require('fluent-ffmpeg');
   global.XLSX = require('xlsx');
   global.excelbuilder = require('msexcel-builder');
   global.gcm = require('node-gcm');
   global.apn = require("apn")
   global.neo4j = require('node-neo4j');
   global.ejs=require('ejs');
   global.gm=require('gm').subClass({imageMagick: true});
   global.EmailTemplate = require('email-templates').EmailTemplate;
   global.path = require('path');
   global.express = require('express');
   global.errorHandler = require('errorhandler')
   global.bodyParser = require('body-parser')
   global.Promise = require('node-promise').Promise
   global.async = require('async')
   global.crypto = require('crypto')
   global.uuid = require('node-uuid');
   global.winston = require('winston');
   global.ifAsync = require('if-async')
   global.file = require('fs');
   global.mqtt = require('mqtt');
   global.sync = require('synchronize')
   global.mosca = require('mosca');
   // Database dependencies and Connection setting
   global.mongoose = require('mongoose');
   //Redis Cache Dependencies
   global.redis = require('ioredis');
   global.MongooseRedis = require('mongoose-with-redis');

   global.mongooseSchema = mongoose.Schema;
   global.dbConnection = require('./Datasource.js').getDbConnection()
  //  global.dbConnectionWeoneAdvertiser = require('./Datasource_weone_advertiser.js').getDbConnection()
   global.passcode = require("passcode");
   //global variable to hold all the environment specific configuration
   global.configurationHolder = {}

   // Application specific configuration details
   configurationHolder.config = require('./Conf.js').configVariables()

    //Application specific intial program to execute when server starts
    configurationHolder.Bootstrap = require('./Bootstrap.js')

   // Application specific security authorization middleware
   configurationHolder.security = require('../application-middlewares/AuthorizationMiddleware').AuthorizationMiddleware

   //UTILITY CLASSES
   configurationHolder.EmailUtil = require('../application-utilities/EmailUtility')
   configurationHolder.ResponseUtil = require('../application-utilities/ResponseHandler.js')
   configurationHolder.Message = require('./ApplicationMessages').Message
   global.Logger = require('../application-utilities/LoggerUtility').logger
   global.redis_client = redis.createClient(configurationHolder.config.redisConf);

   module.exports = configurationHolder
