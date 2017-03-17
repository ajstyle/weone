var AuthenticationService = require("../services/common/AuthenticationService").AuthenticationService;


module.exports = (function () {

   /*
    *  This method allow user to login
    *  call authenticate function of AuthenticationService
    *  generate authentication token for the end user and return the token
    */
   var userLogin =  function (req,res,callback) {
         AuthenticationService.authenticate(req.body.email,req.body.password,callback)

   }

   var userLogout = function (req,res,callback) {
      //  Logger.info("control in the controller layer of user logout",req.get('X-Auth-Token'));
     AuthenticationService.userLogout(req.get('X-Auth-Token'),callback)
   }

   var forgotPassword = function (req,res,callback) {
       AuthenticationService.forgotPassword(req.params.email,res,callback)
   }
   var deleteAccount =function (req,res,callback){

   AuthenticationService.deleteAccount(req.get('X-Auth-Token'),callback,req)


   }


   var resetPassword = function (req,res,callback) {
      //  Logger.info("reset password..controller")
         AuthenticationService.resetPassword(req,res,callback)
   }
   var verifyLink=function(req,res,callback){
      //  Logger.info("verify link controller ");
       var verifytoken=req.params.token;
       AuthenticationService.verifyRegEmail(verifytoken,res);
   }

   /*
    Function is used to verify the OTP entered by the user by taking X-Auth-Token in Header and       json object in body
*/
    var verifyOTP = function (req, res, callback) {
        // Logger.info("control in the verifyOTP");
        var verifyObject = req.body.verifyObject;
        //var xauthtoken = req.get('X-Auth-Token');
        AuthenticationService.verifyOTPCode(verifyObject,req.loggedInUser,callback);
    }

    var generateOTP = function(req, res, callback){
      AuthenticationService.generateOTP(req.get('X-Auth-Token'),callback);
    }

    var otp_update_email = function(req, res, callback){
      var email = req.params.email;
      // Logger.info("the email id is",email);
      AuthenticationService.otp_update_email(req.get('X-Auth-Token'), email, callback);
    }

    var reset_badge_count = function(req, res, callback){
      AuthenticationService.reset_badge_count(req.get('X-Auth-Token'), req.params, callback);
    }

    var userInfo = function(req, res, callback){
      AuthenticationService.userInfo(req.loggedInUser._id, req.body.user, callback);
    }

    var resendVerifyEmail = function(req,res,callback){
      // Logger.info("Resend Verification Email Controller");
      var userEmail = req.params.email;
      AuthenticationService.resendVerificationLink(userEmail,callback);
   }
    var url_change = function(req, res, callback){
      // Logger.info("the params are",req.query);
      AuthenticationService.url_change(req.query, callback);
    }

    var getServerStatus = function(req, res, callback){
      callback(null,SetResponse.setSuccess("Server is Running"));
    }

    var addUsersToTree = function(req, res, callback){
      AuthenticationService.addUsersToTree(callback);
    }

    var addOrphanedUsers = function(req, res, callback){
      AuthenticationService.addOrphanedUsers(callback);
    }

  //public methods are  return
  return {
      userLogin: userLogin,
      userLogout:userLogout,
      forgotPassword:forgotPassword,
      resetPassword:resetPassword,
      verifyLink:verifyLink,
      deleteAccount:deleteAccount,
      verifyOTP:verifyOTP,
      generateOTP:generateOTP,
      otp_update_email:otp_update_email,
      reset_badge_count:reset_badge_count,
      userInfo:userInfo,
      resendVerifyEmail:resendVerifyEmail,
      url_change:url_change,
      getServerStatus:getServerStatus,
      addUsersToTree:addUsersToTree,
      addOrphanedUsers:addOrphanedUsers
  };

})();
