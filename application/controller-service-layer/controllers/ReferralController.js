var SetResponse = require('../services/SetResponseService');
module.exports = function () {
    //it will get all the rewards of user
    var verifyRefferalCode = function (req, res, callback) {
      var referredId = req.params.referred_id;
      var mobileNumber = req.params.mobileNumber;
      this.services.referralService.verifyRefferalCode(mobileNumber, referredId, callback);
    }

    var generateReferralIdsScript = function(req, res, callback){
      this.services.referralService.generateReferralIdsScript(callback);
    }

    var getAndUpdateReferralIdsScript = function(req,res,callback){
    this.services.referralService.getAndUpdateReferralIdsScript(callback);
    }

    return {
      verifyRefferalCode:verifyRefferalCode,
      generateReferralIdsScript:generateReferralIdsScript,
      getAndUpdateReferralIdsScript:getAndUpdateReferralIdsScript
    }
};
