var SetResponse = require('../services/SetResponseService');
module.exports = function () {
    //it will get all the rewards of user
    var setPaymentRequest = function (req, res, callback) {

      if(!req.loggedInUser){
        //Logger.info("jjjjj",req.loggedInUser);
        callback(new Error("You are not authorized."))
      }else {
        this.services.userDataService.setPaymentRequest(req.loggedInUser, callback);
      }
    }

    var getInviteList = function(req, res, callback){
      if(!req.loggedInUser){
        //Logger.info("jjjjj",req.loggedInUser);
        callback(new Error("You are not authorized."))
      }else {
        this.services.userDataService.getInviteList(req.loggedInUser, callback);
      }
    }

    var getUserRequests = function(req, res, callback){
      var limit = parseInt(req.params.limit);
      var skip = parseInt(req.params.skip);
      if(!req.loggedInUser){
        //Logger.info("jjjjj",req.loggedInUser);
        callback(new Error("You are not authorized."))
      }else {
        //Logger.info("the params are",req.params);
        this.services.userDataService.getUserRequests(req.params.type,limit,skip, callback);
      }
    }

    var setUserRequest = function(req, res, callback){
      if(!req.loggedInUser){
        //Logger.info("jjjjj",req.loggedInUser);
        callback(new Error("You are not authorized."))
      }else {
        //Logger.info("the body is",req.body);
        this.services.userDataService.setUserRequest(req.body.user, callback);
      }
    }

    var addInviters = function(req, res, callback){
      this.services.userDataService.addInviters(callback);

    }

    var modifyTreeStructure = function(req, res, callback){
      this.services.userDataService.modifyTreeStructure(callback);
    }

    var removeCycleFromTree = function(req, res, callback){
      this.services.userDataService.removeCycleFromTree(callback);
    }

    var getNetworkTree = function(req, res, callback){
      this.services.userDataService.getNetworkTree(req.loggedInUser, callback);
    }

    var getReceiptFillingDetails = function(req, res, callback){
      this.services.userDataService.getReceiptFillingDetails(req.loggedInUser, callback);
    }

    var generateReceipt = function(req, res, callback){
      this.services.userDataService.generateReceipt(req.loggedInUser, req.body, callback);
    }

    var scriptGenerateNetworkTree = function(req, res, callback){
      this.services.userDataService.scriptGenerateNetworkTree(req.params.id, callback);
    }

    var getTreeLevel = function(req, res, callback){
      // Logger.info("skip limit level and auth token is ",req.params.skip,req.params.limit,req.params.level,req.loggedInUser);
      this.services.userDataService.getTreeLevel(req.loggedInUser, req.params.level, req.params.skip, req.params.limit, callback);
    }
    var getTreeLevelAdmin = function(req, res, callback){
      // Logger.info("skip limit level and auth token is ",req.params.skip,req.params.limit,req.params.level,req.params.id);
      this.services.userDataService.getTreeLevelAdmin( req.params.level,req.params.id, req.params.skip, req.params.limit, callback);
    }

    var developMLMTree = function(req, res, callback){
      this.services.userDataService.developMLMTree(callback);
    }
    var getVoucherDetails = function(req, res, callback){
      var skip=req.params.skip;
      var limit=req.params.limit;
      this.services.userDataService.getVoucherDetails(skip,limit,callback);
    }
    var voucherWithUserId = function(req, res, callback){
      var userId=req.params.userId;
      var skip=parseInt(req.params.skip);
      var limit=parseInt(req.params.limit);
      // Logger.info("id skip and limit is",userId,skip,limit,req.params);
      this.services.userDataService.voucherWithUserId(userId,skip,limit,callback);
    }
    var viewVoucherOfUser = function(req, res, callback){

      this.services.userDataService.viewVoucherOfUser(req.params.id,callback);
    }
    var searchUsersInDeleteRequest = function (req, res, callback) {
        // Logger.info("control in the searchAdminWithBankingDetails admin ");
        var email = req.params.email;
        // Logger.info("email is",req.params.email);
        // Logger.info("limit is",req.params.limit);
        // Logger.info("skip is",req.params.skip);

        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        this.services.adminUserService.searchUsersInDeleteRequest(email, skip, limit, callback);
    }
    var searchUsersInPaymentRequest = function (req, res, callback) {
        // Logger.info("control in the searchAdminWithBankingDetails admin ");
        var email = req.params.email;
        // Logger.info("email is",req.params.email);
        // Logger.info("limit is",req.params.limit);
        // Logger.info("skip is",req.params.skip);

        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        var type =req.params.type;
        this.services.adminUserService.searchUsersInPaymentRequest(type,email, skip, limit, callback);
    }




    var getVoucherDetails = function(req, res, callback){
      var skip=req.params.skip;
      var limit=req.params.limit;
      this.services.userDataService.getVoucherDetails(skip,limit,callback);
    }


    var viewVoucherOfUser = function(req, res, callback){
      this.services.userDataService.viewVoucherOfUser(req.params.id,callback);
    }

    var getEarningDetails=function(req,res,callback){
      // Logger.info(" controller to get user earning information with id ",req.params.userid);
      // var skip=parseInt(req.params.skip);
      // var limit=parseInt(req.params.limit);
      this.services.userDataService.getUserEarningDetailsById(req.params.userid,callback);
    }

    var getUserEarningDetailsByDate=function(req,res,callback){
      // Logger.info(" controller to get user earning information with id ",req.params.userid);
      // var skip=parseInt(req.params.skip);
      // var limit=parseInt(req.params.limit);
      this.services.userDataService.getUserEarningDetailsByIdAndDate(req.params.userid,req.params.date,callback);
    }

    return {
      setUserRequest:setUserRequest,
      getInviteList:getInviteList,
      getUserRequests:getUserRequests,
      addInviters:addInviters,
      setPaymentRequest:setPaymentRequest,
      modifyTreeStructure:modifyTreeStructure,
      removeCycleFromTree:removeCycleFromTree,
      getNetworkTree:getNetworkTree,
      getReceiptFillingDetails:getReceiptFillingDetails,
      generateReceipt:generateReceipt,
      scriptGenerateNetworkTree:scriptGenerateNetworkTree,
      getTreeLevel:getTreeLevel,
      developMLMTree:developMLMTree,
      setPaymentRequest:setPaymentRequest,
      getVoucherDetails:getVoucherDetails,
      voucherWithUserId:voucherWithUserId,
      viewVoucherOfUser:viewVoucherOfUser,
      getTreeLevelAdmin:getTreeLevelAdmin,
      searchUsersInDeleteRequest:searchUsersInDeleteRequest,
      searchUsersInPaymentRequest:searchUsersInPaymentRequest,
      getEarningDetails:getEarningDetails,
      getUserEarningDetailsByDate:getUserEarningDetailsByDate
    }
};
