var SetResponse = require('../services/SetResponseService');
module.exports = function () {
    //it will get all the rewards of user
    var getRewardOfUser = function (req, res, callback) {
            //Logger.info("control in the get rewards");
            var limit = parseInt(req.params.limit);
            var skip = parseInt(req.params.skip);
            this.services.moneyService.getRewardsService(req.loggedInUser._id, limit, skip, callback);
        }
        //it will create the reward
    var createRewardsForAdmin = function (req, res, callback) {
        //Logger.info("control in the create rewards for admin");
        // Logger.info("reward in controller is",req.body);
        var rewardObject = req.body.reward;
        var userIds = req.body.userIds;
        var selectedAll=req.body.selectedAll;
        this.services.moneyService.createRewardsService(rewardObject, userIds,selectedAll, callback);
    }

    var getRewardListForAdmin = function (req, res, callback) {
        //Logger.info("Control in the get reward list for money controller");
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        this.services.moneyService.getRewardList(skip, limit, callback);
    }

    var updateRewards=function(req,res,callback){
        //Logger.info("Control in the update rewards");
        var reward = req.body.reward;
        if(reward)
        this.services.moneyService.updateReward(reward,callback);
    }

    var deleteRewards = function (req, res, callback) {
        //Logger.info("Control in the delete reward service");
        var reward_id = req.body.reward_id;
        if(reward_id)
        this.services.moneyService.deleteReward(reward_id, callback);
    }

    var getUserNetworkMoneyVideos = function (req, res, callback) {
        //Logger.info("control in the getUserNetworkMoneyVideos in UserController");
        // var xAuthToken = req.get('X-Auth-Token');
        //this.services.moneyService.getUserNetworkMoneyVideos(xAuthToken, callback)
        this.services.moneyService.getUserNetworkMoneyVideos(req.loggedInUser, callback)
    }
    var getClientMoneyDetails = function (req, res, callback) {
        //Logger.info("control in the get client money ");
        this.services.moneyService.getClientMoneyDetails(req.body.clientId, req.body.date, req.body.limit, req.body.skip, callback);
    }

    var getClickViewUser = function (req, res, callback) {
        //Logger.info("control in the getClickViewUser");
        this.services.moneyService.getAdViewClickUser(req.params.id, req.params.type, callback);
    }

    var getUserPerDayEarning = function (req, res, callback) {
        Logger.info("control in the get user per day earning");
        this.services.moneyService.getUserPerDayEaring(req.params.date, req.params.limit, req.params.skip, callback);
    }
    var getAdminRevenue = function (req, res, callback) {
        //Logger.info("control in the get admin revenue");
        this.services.moneyService.getAdminRevenue(callback);
    }
    var getNotificationUser = function (req, res, callback) {
        //Logger.info("control in the get notification of user");
        this.services.moneyService.getUserNotifications(req.loggedInUser, callback);
    }

    var saveAccountDetails = function (req, res, callback) {
        //Logger.info("control in saveAccountDetails userin moneyController");
        var acccountDetailsObj = req.body.accountObj;
        if (acccountDetailsObj)
            this.services.moneyService.saveAccountDetails(acccountDetailsObj, req.loggedInUser._id, callback);
    }

    var showTreeOnAdmin = function (req, res, callback) {
        //Logger.info("Control in the show tree in admin side");
        var self = this;
        domain.User.findOne({
            _id: req.params.userid,
            deleted: false
        }, function (err, userObject) {
            self.services.showTreeService.networkStatusService(userObject, callback)
        })
    }
    var searchUserIncome = function (req, res, callback) {
        // Logger.info("control in the searchAdminWithBankingDetails admin ");
        var email = req.params.email;
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        var date=req.params.date;
        this.services.scriptService.searchUserIncome(date,email, skip, limit, callback);
    }

    var savePaymentInfo = function (req, res, callback) {
        //Logger.info("control in saveAccountDetails userin moneyController");
        var acccountDetailsObj = req.body.accountObj;
        if (acccountDetailsObj)
            this.services.moneyService.savePaymentInfo(acccountDetailsObj, req.loggedInUser._id, callback);
    }

    return {
        getRewardOfUser: getRewardOfUser,
        createRewardsForAdmin: createRewardsForAdmin,
        getUserNetworkMoneyVideos: getUserNetworkMoneyVideos,
        getClientMoneyDetails: getClientMoneyDetails,
        getClickViewUser: getClickViewUser,
        getUserPerDayEarning: getUserPerDayEarning,
        getAdminRevenue: getAdminRevenue,
        getNotificationUser: getNotificationUser,
        saveAccountDetails: saveAccountDetails,
        showTreeOnAdmin: showTreeOnAdmin,
        getRewardListForAdmin: getRewardListForAdmin,
        deleteRewards:deleteRewards,
        updateRewards:updateRewards,
        searchUserIncome:searchUserIncome,
        savePaymentInfo:savePaymentInfo

    }
};
