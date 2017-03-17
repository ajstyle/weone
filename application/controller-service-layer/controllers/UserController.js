var encrypt = require('../../../application-utilities/EncryptionUtility');
var AuthenticationService = require("../services/common/AuthenticationService").AuthenticationService;
var SetResponse = require('../services/SetResponseService');
module.exports = function () {

    var updateUser = function (req, res, callback) {
        //Logger.info("control in the update the update user controller")
        var self = this;
        if (req.body.user.id) {
            var id = req.body.user.id;
            self.services.userService.updateUser(id, req.body.user, callback)
        } else {
            var token = req.get("X-Auth-Token");
            //Logger.info("token", token);
            domain.Authentication_Token.findOne({
                authToken: token,
                deleted: false
            }, function (err, obj) {

                if (obj) {
                  // Logger.info("user ",obj.user," userBody ",req.body.user)
                    self.services.userService.updateUser(obj.user, req.body.user, callback);
                } else {
                    //Logger.info("No auth token find");
                    callback(SetResponse.setError(configurationHolder.Message.Error.unauthorize, 401), null)
                }
            });
        }
    }
        //api for search the user on regex bases
        var searchAdmin = function (req, res, callback) {
            // Logger.info("control in the search admin ");
            var email = req.params.email;
            var limit = parseInt(req.params.limit);
            var skip = parseInt(req.params.skip);
            var role = req.params.role;
            this.services.adminUserService.searchAdminService(email, skip, limit, role, callback);
        }

        var uploadImage = function (req, res, callback) {
            // Logger.info("control in the uploadImage",req.body);
            if (req.files.file != undefined) {
                var file = req.files.file;
                var type=req.get('type');
                // Logger.info("type of media",type);
                this.services.userService.uploadImage(file,type,callback);
            } else {
                callback(new Error('Invalid format.'))
            }
        }

    var getAllUserAdminPanel = function (req, res, callback) {
      // Logger.info("in getall user admin method");
        //Logger.info("control in the get all user admin side controller");
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        var role = req.params.role;
        // if(req.params.date){
        //   var date=req.params.date;
        // }else {
        //   var date = 0;
        // }
        var date = 0;
        // Logger.info("date is",date);
        this.services.adminUserService.getAllUserServicePanel(date,role, limit, skip, callback);
    }
    var getAllUserAdmin = function (req, res, callback) {
      // Logger.info("in getall user admin method");
        //Logger.info("control in the get all user admin side controller");
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        var role = req.params.role;
        var date = 0;
        this.services.adminUserService.getAllUserServicePanel(date,role, limit, skip, callback);
        // var date=req.params.date;
        // this.services.adminUserService.getAllUserService(role, limit, skip, callback);
    }
    var getAllUserAdminPanel = function (req, res, callback) {
      // Logger.info("in getall user admin method");
        //Logger.info("control in the get all user admin side controller");
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        var role = req.params.role;
        var date=req.params.date;
        // Logger.info("date is",date);
        this.services.adminUserService.getAllUserServicePanel(date,role, limit, skip, callback);
    }
    var checkEmailExistance = function (req, res, callback) {
        //Logger.info("control user controller for checkEmailExistance");
        var email = req.params.email;
        var role = req.params.role;
        this.services.adminUserService.checkEmailService(email, role, callback);
    }
    var sendInvitation = function (req, res, callback) {
        //Logger.info("control in the send invitation",req.body);
        var mobilenumbers = req.body.mobilenumbers;
        var platform = req.body.platform;
        this.services.userService.sendInvitationService(mobilenumbers, platform, req.loggedInUser, callback);
    }

    var getUserContactsList = function (req, res, callback) {
        //Logger.info("control in the getUserContactsList in UserController");
        var contactList = req.body.phonebook_details;
        this.services.userService.getUserContactsList(contactList,req.loggedInUser, callback)
    }

    var getUserFriends = function (req, res, callback) {
        //Logger.info("control in the getUserFriends in UserController");
        this.services.userService.getUserFriends(req.loggedInUser, callback)

    }
    var appStatus = function (req, res, callback) {
        //Logger.info("control in the change status in app");
        var status = req.params.status;
        this.services.userService.changeAppStatus(status, req.loggedInUser, callback);
    }

    var userSettings = function (req, res, callback) {
        //Logger.info("control in the setting of user");
        var settingObject = req.body.settingObject;
         settingObject.user_id = req.loggedInUser._id;
         this.services.userService.userSettingsService(settingObject, callback);
    }
    var getUserProfile=function(req,res,callback){
        //Logger.info("control in the get user profile");
        var userid=req.params.userid;
        this.services.userService.getUserProfileService(userid,callback);
    }

    var blockUnblockUser=function(req,res,callback){
        //Logger.info("control in the block user");
        var friendId=req.body.friendId;
        var blockUnblockFlag=req.body.blockUnblockFlag;
        this.services.userService.blockUserService(req.loggedInUser._id,friendId,blockUnblockFlag,callback);
    }

    var getBlockList=function(req,res,callback){
        //Logger.info("control in the get block list");
         this.services.userService.getBlockUserService(req.loggedInUser._id,callback);
    }

    var userLastSeen=function(req,res,callback){
       //Logger.info("control in the user last seen",req.loggedInUser._id);
       this.services.userService.userLastSeenService(req.loggedInUser._id,callback)
    }

    var getUserLastSeen=function(req,res,callback){
        //Logger.info("control in the get last seen",req.params.userid);
        this.services.userService.getUserLastSeenService(req.params.userid,callback);
    }

    var addUnderInviter = function(req, res, callback){
        this.services.userService.addUnderInviter(req.body, callback)
    }

    var sendGlobalPushNotifications = function(req, res, callback){
      // Logger.info("body of user is ",req.body);
        this.services.userService.sendGlobalPushNotifications(req.body, callback);
    }

    var deleteRequest = function(req, res, callback){
        var otp = req.body.otp.toString();
        var deleteRequest = req.body.delete;
        this.services.userService.deleteRequest(req.loggedInUser._id, otp, deleteRequest, callback);
    }

    var update_email = function(req, res, callback){
        var otp = req.body.otp.toString();
        this.services.userService.update_email(req.get('X-Auth-Token'), otp, callback);
    }

    var fetch_delete_requests = function(req, res, callback){
      var limit = parseInt(req.params.limit);
      var skip = parseInt(req.params.skip);
      this.services.userService.fetch_delete_requests(limit,skip,callback);
  }

  var set_delete_requests = function(req, res, callback){
      this.services.userService.set_delete_requests(req.body, req.get('X-Auth-Token'), callback);
  }

  var delete_request_status = function(req, res, callback){
      this.services.userService.delete_request_status(req.get('X-Auth-Token'), callback);
  }

  var edit_comments = function(req, res, callback){
      this.services.userService.edit_comments(req.body, callback);
  }

  var delete_comment = function(req, res, callback){
      this.services.userService.delete_comment(req.body, callback);
  }

  var generateVoucher = function(req,res,callback){
   this.services.userService.generateVoucher(req.loggedInUser._id,req.body,res,callback);
  }

  var getVouchers = function(req,res,callback){
    Logger.info(req.params);
    var skip = parseInt(req.params.skip),
    limit = parseInt(req.params.limit),
    userId = req.loggedInUser._id;
    this.services.userService.getVouchers(userId,skip,limit,callback);
  }

  var getReceiptAmount = function(req,res,callback){
   this.services.userService.getReceiptAmount(req.loggedInUser._id,req.body,res,callback);
  }

  var getUserBankDetailByToken=function(req,res,callback){
    this.services.userService.getUserBankDetailByToken(req.loggedInUser,callback);
  }

  var getUserBankDetail=function(req,res,callback){
     var skip=req.params.skip;
     var limit=req.params.limit;
    //  Logger.info("limit is ");
     this.services.userService.getUserBankDetail(skip,limit,callback);
   }
   var getUserBankDetailById=function(req,res,callback){
    //  Logger.info("userid for his bank detail is ",req.params.id);
     this.services.userService.getUserBankDetailById(req.params.id,callback);
   }
   var searchAdminWithBankingDetails = function (req, res, callback) {
      //  Logger.info("control in the searchAdminWithBankingDetails admin ");
       var email = req.params.email;
       var limit = parseInt(req.params.limit);
       var skip = parseInt(req.params.skip);
       this.services.adminUserService.searchAdminServiceWithBankingDetails(email, skip, limit, callback);
   }
   var searchAdminWithVoucherDetails = function (req, res, callback) {
      //  Logger.info("control in the searchAdminWithBankingDetails admin ");
       var email = req.params.email;
       var limit = parseInt(req.params.limit);
       var skip = parseInt(req.params.skip);
       this.services.adminUserService.searchAdminServiceWithVoucherDetails(email, skip, limit, callback);
   }


return {
    updateUser: updateUser,
    searchAdmin: searchAdmin,
    getAllUserAdmin: getAllUserAdmin,
    getAllUserAdminPanel:getAllUserAdminPanel,
    uploadImage: uploadImage,
    checkEmailExistance: checkEmailExistance,
    sendInvitation: sendInvitation,
    getUserContactsList: getUserContactsList,
    getUserFriends: getUserFriends,
    appStatus: appStatus,
    userSettings: userSettings,
    getUserProfile:getUserProfile,
    blockUnblockUser:blockUnblockUser,
    getBlockList:getBlockList,
    userLastSeen:userLastSeen,
    getUserLastSeen:getUserLastSeen,
    addUnderInviter:addUnderInviter,
    sendGlobalPushNotifications:sendGlobalPushNotifications,
    deleteRequest:deleteRequest,
    update_email:update_email,
    fetch_delete_requests:fetch_delete_requests,
    set_delete_requests:set_delete_requests,
    delete_request_status:delete_request_status,
    edit_comments:edit_comments,
    delete_comment:delete_comment,
    generateVoucher : generateVoucher,
    getVouchers : getVouchers,
    getReceiptAmount:getReceiptAmount,
    getUserBankDetailByToken:getUserBankDetailByToken,
    getUserBankDetail:getUserBankDetail,
    getUserBankDetailById:getUserBankDetailById,
    searchAdminWithBankingDetails:searchAdminWithBankingDetails,
    searchAdminWithVoucherDetails:searchAdminWithVoucherDetails,
    getAllUserAdminPanel:getAllUserAdminPanel,

}
};
