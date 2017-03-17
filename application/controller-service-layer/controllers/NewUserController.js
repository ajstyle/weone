var encrypt = require('../../../application-utilities/EncryptionUtility');
var AuthenticationService = require("../services/common/AuthenticationService").AuthenticationService;
var SetResponse = require('../services/SetResponseService');
module.exports = function () {

  var verifyPincode = function(req,res,callback){
    this.services.newUserService.verifyPincode(req.params, callback)
  }


  return {
    verifyPincode:verifyPincode

  }
};
