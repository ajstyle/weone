var encrypt = require('../../../application-utilities/EncryptionUtility');
var AuthenticationService = require("../services/common/AuthenticationService").AuthenticationService;
var SetResponse = require('../services/SetResponseService');
module.exports = function () {

  var generateOTP = function (req, res, callback) {
    this.services.userSessionService.generateOTP(req.params.phonenumber, callback)
  }

  var verifyOTP = function(req,res,callback){
    var reqObj = {
      phonenumber:parseInt(req.body.verifyObject.mobileNumber),
      otp:parseInt(req.body.verifyObject.otp),
      registration_token:req.body.verifyObject.registration_token,
      app_platform:req.body.verifyObject.app_platform
    }
    this.services.userSessionService.verifyOTP(reqObj, callback)
  }

  var deviceDetails = function(req,res,callback){
    this.services.userSessionService.deviceDetails(req.loggedInUser._id,req.body, callback)
  }

  var userInfo = function(req,res,callback){
    this.services.userSessionService.userInfo(req.loggedInUser, callback)
  }

  var createUserPin = function(req, res, callback){
    this.services.userSessionService.createUserPin(req.loggedInUser, req.params.pin, callback)
  }

  var updateUserPin = function(req, res, callback){
    console.log("hello");
    this.services.userSessionService.updateUserPin(req.loggedInUser, req.params.pin, callback)
  }

  var likeUnlike = function(req, res, callback){
    var params = req.params;
    this.services.userSessionService.likeUnlike(req.loggedInUser,params,callback);
  }

  var uploadMedia = function(req, res, callback){
    if (req.files.file != undefined) {
        var file = req.files.file;
        var type=req.get('type');
        // Logger.info("type of media",type);
        this.services.userSessionService.uploadMedia(file,type,callback);
    } else {
        callback(new Error('Invalid format.'))
    }
  }

  var isPhonenumberAvail = function(req, res, callback){
    this.services.userSessionService.isPhonenumberAvail(req.params.phonenumber, req.loggedInUser, callback);
  }

  var updatePhonenumber = function(req, res, callback){
    this.services.userSessionService.updatePhonenumber(req.loggedInUser,req.params.phonenumber,callback);
  }

  var setDeleteRequest = function(req, res, callback){
    this.services.userSessionService.setDeleteRequest(req.loggedInUser,req.params,callback);
  }

  var deleteById = function(req, res, callback){
    this.services.userSessionService.deleteById(req.params,callback);
  }

  var getAuthByPhonenumber = function(req, res, callback){
    this.services.userSessionService.getAuthByPhonenumber(req.params,callback);
  }

  var getUserByPhonenumber = function(req, res, callback){
    this.services.userSessionService.getUserByPhonenumber(req.params,callback);
  }

  var getUserExistence = function(req, res, callback){
    this.services.userSessionService.getUserExistence(req.params,callback);
  }

  var isVersionUpdated = function(req, res, callback){
    this.services.userSessionService.isVersionUpdated(req.loggedInUser, req.params, callback);
  }

  var updateVersion = function(req, res, callback){
    this.services.userSessionService.updateVersion(req.params, callback);
  }

  var smsCountryRes = function(req, res, callback){
    this.services.userSessionService.smsCountryRes(req.query, callback);
  }

  var isPhonenumberVerified = function(req, res, callback){
    this.services.userSessionService.isPhonenumberVerified(req.params, callback);
  }

  var isNewPhonenumberVerified = function(req, res, callback){
    this.services.userSessionService.isNewPhonenumberVerified(req.params, req.loggedInUser, callback);
  }

return {
  generateOTP:generateOTP,
  verifyOTP:verifyOTP,
  deviceDetails:deviceDetails,
  userInfo:userInfo,
  createUserPin:createUserPin,
  updateUserPin:updateUserPin,
  likeUnlike:likeUnlike,
  uploadMedia:uploadMedia,
  isPhonenumberAvail:isPhonenumberAvail,
  updatePhonenumber:updatePhonenumber,
  setDeleteRequest:setDeleteRequest,
  deleteById:deleteById,
  getAuthByPhonenumber:getAuthByPhonenumber,
  getUserByPhonenumber:getUserByPhonenumber,
  getUserExistence:getUserExistence,
  isVersionUpdated:isVersionUpdated,
  updateVersion:updateVersion,
  smsCountryRes:smsCountryRes,
  isPhonenumberVerified:isPhonenumberVerified,
  isNewPhonenumberVerified:isNewPhonenumberVerified
}
};
