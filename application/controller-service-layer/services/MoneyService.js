var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
var PushService = require("./PushService");
var Client = require('node-rest-client').Client;
var client = new Client();
MoneyService = function (app) {
    this.app = app;
};

MoneyService.prototype = new BaseService();

/* Function is used to add Cr,Lac,K according to the value
    @return converted or formatted value
*/

var numDifferentiation = function numDifferentiation(val) {
    if(val >= 10000000) val = (val/10000000).toFixed(2) + ' Cr';
    else if(val >= 100000) val = (val/100000).toFixed(2) + ' Lac';
    else if(val >= 1000) val = (val/1000).toFixed(2) + ' K';
    return val;
}

/*This function is used to provide the rewards to user and sort according to latest reward
@user_id:user object id @limit @skip used for paggination */
    MoneyService.prototype.getRewardsService = function (user_id, limit, skip, callback) {
            //Logger.info(limit, skip, "control in the get reward service", user_id);
            domain.Master_Reward.find({
                "user_details.user_id": user_id,
                deleted: false
            }, {
                user_details: 0,
                _id: 0
            }).limit(limit).skip(skip).sort({
                reward_Date: -1
            }).lean().exec(function (err, rewardObjects) {
              if(rewardObjects){
                for(var i =0;i<rewardObjects.length;i++){
                    var cashAmt = numDifferentiation(rewardObjects[i].cash_amount);
                    rewardObjects[i].cash_amount = cashAmt;
                }
              }else {
                rewardObjects = [];
              }
            callback(err, SetResponse.setSuccess("rewards", rewardObjects));
        });
    }

    /*This function is used to generate 8-digit unique coupon code for user to create the coupon*/
function makeCouponCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
/*
This function is used to create the rewards for user from admin pannel.
@rewardObject:It contains the reward object information
@userIds:it is array of user ids to send the reward multiple user at same time
*/
MoneyService.prototype.createRewardsService = function (rewardObject, userIds,selectedAll, callback) {
        //Logger.info("control in the create reward service", rewardObject);
        Logger.info("reward object is ",rewardObject);
        rewardData.rewardObject = rewardObject;
        rewardData.rewardObject.reward_id= new Date().getTime() + Math.floor(Math.random() * 10000);
        rewardData.rewardObject.coupon = {};
        rewardData.rewardObject.coupon.coupon_code = makeCouponCode();
        async.map(userIds, rewardData.getAllUserInformation.bind(rewardData), function (err, result) {
            //Logger.info("control in rewards result");
            //Logger.info("result", result.toString());
            callback(null, SetResponse.setSuccess("rewards created", result));
        });
    }
    /*
    This function find the all the user information and find their platform ios/android and send them push notification and store noti. into db
    */
var rewardData = {
        getAllUserInformation: function (_id, callback) {
            //Logger.info("get all user info ", _id);
            var rewardMainObject = this.rewardObject;
            domain.User.findOne({
                _id: _id,
                deleted: false
            }, function (err, userObject) {
                //Logger.info("userobject", userObject.toString());
                var user_details = {};
                user_details.user_id = userObject._id;
                user_details.age = userObject.age;
                user_details.gender = userObject.gender;
                var app_platform = userObject.app_platform;
                if (app_platform == "ios") {
                    PushService.apnsPushNotification(userObject._id, configurationHolder.Message.Success.rewardNotificationMessage, userObject.registration_token, "reward");
                } else if (app_platform == "android") {
                    PushService.gcmPushNotification(configurationHolder.Message.Success.rewardNotificationMessage, userObject.registration_token, "reward");
                } else {
                    //Logger.info("invalid platform");
                }
                rewardMainObject.user_details = user_details;
                saveRewards(rewardMainObject, callback);
                saveNotification({
                    app_platform: app_platform,
                    device_token: userObject.registration_token,
                    user_id: userObject._id,
                    notification_type: 'reward',
                    notification_message: configurationHolder.Message.Success.rewardNotificationMessage,
                    time_stamp: new Date().getTime()
                });
            });
        }
    }
    /*This function store the notification in db which is send by admin and maintain the time*/
var saveNotification = function (rewardNotificationObject) {
        //Logger.info("control in the saved notification of reward")
        var Notification_History_object = new domain.Notification_History(rewardNotificationObject);
        Notification_History_object.save(function (err, savedHistoryOjbect) {
            //Logger.info(err, "reward Notification history saved");
        });
    }
    /*This function is used to saveRewards in database*/
var saveRewards = function (rewardObject, callback) {
        //Logger.info("control in the saveRewards", rewardObject)
        var rewardObj = new domain.Master_Reward(rewardObject);
        rewardObj.save(function (err, object) {
            callback(null, object);
        });
    }

MoneyService.prototype.getRewardList = function (skip, limit, callback) {
    //Logger.info(limit, "Control in the get reward list", skip);
    var object = {};
    domain.Master_Reward.aggregate([{
            $match: {
                deleted: false
            }
    }, {
            $group: {
                _id: "$reward_id",
                total_users: {
                    $sum: 1
                },
                reward_name: {
                    $first: "$name"
                },
                reward_type: {
                    $first: "$type"
                },
                cash_amount: {
                    $first: "$cash_amount"
                },
                coupon_code: {
                    $first: "$coupon.coupon_code"
                },
                reward_date: {
                    $first: "$reward_Date"
                },
                text_to_display:{
                    $first:"$text_to_display"
                }
            }
        },
        {
            $sort: {
                reward_date: -1
            }
        }, {
            $skip: skip
    }, {
            $limit: limit
    }], function (err, rewardObjects) {
        object.rewardObjects = rewardObjects;
        if (skip == 0) {
            domain.Master_Reward.aggregate([{
                $match: {
                    deleted: false
                }
         }, {
                $group: {
                    _id: "$reward_id",
                }
            }], function (err, rewardObjectCount) {
               object.count=rewardObjectCount.length;
            callback(err, SetResponse.setSuccess("rewards list", object));
            })
        } else
            callback(err, SetResponse.setSuccess("rewards list", object));
    });
}

MoneyService.prototype.deleteReward = function (reward_id, callback) {
    //Logger.info("Control in the delete reward method", reward_id);
    domain.Master_Reward.update({
        reward_id: reward_id
    }, {
        $set: {
            deleted: true
        }
    }, {
        multi: true
    }, function (err, deletedRewards) {
       callback(err, SetResponse.setSuccess("rewards deleted", deletedRewards));
    });
}

MoneyService.prototype.updateReward = function (rewardObject, callback) {
    //Logger.info("Control in the updateRewards", rewardObject);
    domain.Master_Reward.update({
        reward_id: rewardObject.reward_id
    }, {
        $set: {
            cash_amount: rewardObject.cash_amount,
            name: rewardObject.name,
            "coupon.coupon_code": rewardObject.coupon.coupon_code,
            "text_to_display": rewardObject.text_to_display,
            "type": rewardObject.type
        }
    }, {
        multi: true
    }, function (err, deletedRewards) {
        callback(err, SetResponse.setSuccess("rewards updated", deletedRewards));
    });

}

    /*This function will provide the all charges of clients on advertisements.@limit @skip for paggination
    @clientId:unique client id for searching charges of client @date:proivde the date filter in the searching the client charges*/
MoneyService.prototype.getClientMoneyDetails = function (clientId, date, limit, skip, callback) {
    //Logger.info(date, "control in the get client money details", clientId, limit, skip);
    var object = {};
    domain.Client_Charge_Per_Day.find({
        "client_details._id": clientId,
        date: {
            $gte: new Date(date)
        }
    }).populate("client_details._id", "name image_url client_account").populate("ad_details.ad_id", "name_of_advert").limit(parseInt(limit)).skip(parseInt(skip)).exec(function (err, clientChargePerDayObject) {
        object.object = clientChargePerDayObject
        if (parseInt(skip) != 0) {
            callback(err, SetResponse.setSuccess("client charges", object));
        } else {
            domain.Client_Charge_Per_Day.find({
                "client_details._id": clientId,
                date: {
                    $gte: new Date(date)
                }
            }).count(function (err, clientChargeCount) {
                //Logger.info("control in the count", clientChargeCount);
                object.count = clientChargeCount
                callback(err, SetResponse.setSuccess("client charges", object));
            })
        }
    });
}

/*This function provide the home screen data for mobile user with their media count and amount in wallet */
MoneyService.prototype.getUserNetworkMoneyVideos = function (usrObject, callback) {
    //Logger.info("control in the getUserNetworkMoneyVideos Money service with xAuthToken..", usrObject._id);
    var resultObject = {}
    var totalAmtAvilable;
    var totalCompleteVideoView = 0;
    var totalImageView = 0;
    if (usrObject) {
      domain.User.update({phonenumber:usrObject.phonenumber},{isPhonenumberVerified:false},function(err,res){
        if(err){
          console.log("Some error in updating the ph verified",err);
        }
      })
        totalAmtAvilable = usrObject.user_account.wallet.wallet_amount_available.toFixed(2);
        domain.User.count({inviter:usrObject._id}).exec(function(err,res){
           //Logger.info("the user is",err,res.user_invite_people);
           if(!err){
             if(parseInt(res) >= 2){
               resultObject.networkStatus = true;
             }else {
               resultObject.networkStatus = false;
             }
             resultObject.totalImageView = 0//totalImageView
             resultObject.totalAmtAvilable = totalAmtAvilable
             resultObject.totalCompleteVideoView = 0//totalCompleteVideoView
             resultObject.referralId = usrObject.referralId
             resultObject.sequenceId = usrObject.sequenceId;
             resultObject.userObject = {};//usrObject
             resultObject.userObject._id = usrObject._id;
             resultObject.userObject.phonenumber = usrObject.phonenumber;
             resultObject.userObject.email = usrObject.email;
             resultObject.userObject.gender = usrObject.gender;
             resultObject.userObject.name = usrObject.name;
             resultObject.userObject.date_of_birth = usrObject.date_of_birth;
             resultObject.userObject.image_url = usrObject.image_url;
             resultObject.userObject.notification_status = usrObject.notification_status;
             resultObject.userObject.last_seen_status = usrObject.last_seen_status;
             resultObject.userObject.view_profile_status = usrObject.view_profile_status;
             resultObject.userObject.read_recepit_status = usrObject.read_recepit_status;

             return callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.homeScreenData, resultObject));
           }else {
             return callback(err,SetResponse.setSuccess("Some error has occurred !"));
           }
         });
    }else {
        return callback(new Error("User not found"));
    }
}

/*This function provide the information to admin which provide the info. about user which watches the advert
@id:it will provide the unqiue id of client charges document
@type:it will provide the charges type ie. view or click*/
MoneyService.prototype.getAdViewClickUser = function (id, type, callback) {
        //Logger.info('control in the get clickviewuser service', id, type)
        var object = {};
        if (type == 'view') {
            domain.Client_Charge_Per_Day.findOne({
                _id: id
            }, {
                "view_users": 1
            }).populate("view_users", "name image_url email phonenumber").lean().exec(function (err, userObjects) {
                object.users = userObjects.view_users;
                callback(err, SetResponse.setSuccess('user view details', object));
            });
        } else if (type == 'click') {
            domain.Client_Charge_Per_Day.findOne({
                _id: id
            }, {
                "click_users": 1
            }).populate("click_users", "name image_url email phonenumber").lean().exec(function (err, userObjects) {
                object.users = userObjects.click_users;
                callback(err, SetResponse.setSuccess('user click details', object));
            });
        } else {
            //Logger.error("wrong type");
        }
    }
    /*This function provide the user per day earning which is calculates from job.It will provide the filter of date of all the user
    @date:used to provide the date filter @limit @skip used for paggination
    */
MoneyService.prototype.getUserPerDayEaring = function (date, limit, skip, callback) {
    var object = {};
    if (date != 0) {
        var date = new Date(date);
        var date1 = new Date(date);
        var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
        userPerDayEarningDateWise(date, oneDayAfter, limit, skip, callback);
    } else {
        //Logger.info("control in the all user earnings");
        domain.User_Earning_Bucket.find({}).sort({
            date_of_earning: -1
        }).limit(parseInt(limit)).skip(parseInt(skip)).populate("user_id", " user_account.wallet.wallet_amount_available name image_url").exec(function (err, userMoneyObject) {
            object.object = userMoneyObject;
            if (!err) {
                domain.User_Earning_Bucket.find({}).count(function (err, userCount) {
                    object.count = userCount;
                    callback(err, SetResponse.setSuccess('user earning', object));
                });
            }
        });
    }
}

var userPerDayEarningDateWise = function (date, oneDayAfter, limit, skip, callback) {
    var object = {};
    domain.User_Earning_Bucket.find({
        date_of_earning: {
            $gt: date,
            $lte: oneDayAfter
        }
    }).populate("user_id", "user_account.wallet.wallet_amount_available name image_url").limit(parseInt(limit)).skip(parseInt(skip)).exec(function (err, userMoneyObject) {
        object.object = userMoneyObject;
        if (parseInt(skip) != 0) {
            callback(err, SetResponse.setSuccess('user earning', object));
        } else {
            domain.User_Earning_Bucket.find({
                date_of_earning: {
                    $gt: date,
                    $lte: oneDayAfter
                }
            }).count(function (err, userCount) {
                //Logger.info("total count of user at this date earning ", userCount);
                object.count = userCount;
                callback(err, SetResponse.setSuccess('user earning', object));
            });
        }
    });
}

/*This used to calulate the admin revenue for last week ,last month and total revenue to show on the dashboard*/
MoneyService.prototype.getAdminRevenue = function (callback) {
  var today = new Date();
  var oneWeekPrevious = new Date(new Date().setDate(new Date().getDate() - 7));
  var oneMonthPrevious = new Date(new Date().setDate(new Date().getDate() - 30));

  var revenueObject = {};
  revenueObject.lastWeekRevenue = 0;
  revenueObject.lastMonthRevenue = 0;
  revenueObject.totalRevenue = 0;

  domain.Admin_Earning_Details.findOne({deleted:false}).lean().exec(function(err,result){
    if(!err){
      revenueObject.totalRevenue = result.total_amount;
      domain.Admin_Earning_Bucket.aggregate({
        $match:{
          date_of_earning:{$gt: oneWeekPrevious, $lte:today}
        }
      },{
        $group: { _id : null, sum : { $sum: "$total_amount" } }
      },function(err, lastWeekRevenue){
        // Logger.info("the week res is",err,lastWeekRevenue);
        if(!err){
          if(lastWeekRevenue.length>0){
            revenueObject.lastWeekRevenue = lastWeekRevenue[0].sum;
          }
          domain.Admin_Earning_Bucket.aggregate({
            $match:{
              date_of_earning:{$gt: oneMonthPrevious, $lte:today}
            }
          },{
            $group: { _id : null, sum : { $sum: "$total_amount" } }
          },function(err, lastMonthRevenue){
            // Logger.info("the month res is",err,lastMonthRevenue);
            if(!err){
              if(lastMonthRevenue.length>0){
                revenueObject.lastMonthRevenue = lastMonthRevenue[0].sum;
              }
              callback(err, SetResponse.setSuccess('admin revenue', revenueObject));
            }else {
              callback(err,SetResponse.setSuccess("Some error has occurred !"));
            }
          })
        }else {
          callback(err,SetResponse.setSuccess("Some error has occurred !"));
        }
      })
    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })
}
    /*This function is used to cal. the admin revenue from last week*/
var adminRevenuForLastWeek = function (callback) {
        var revenueObject = {};
        var oneWeekPrevious = new Date(new Date().setDate(new Date().getDate() - 7));
        domain.Admin_Account_Detail.aggregate([{
            $unwind: "$earning_details"
    }, {
            $match: {
                "earning_details.date": {
                    $gt: oneWeekPrevious
                }
            }
    }, {
            $group: {
                _id: "$_id",
                lastWeekRevenue: {
                    $sum: "$earning_details.amount"
                }
            }
    }], function (err, adminLastWeekObject) {
            //Logger.info(err, "revenu previous month", adminLastWeekObject)
            if (adminLastWeekObject.length) {
                revenueObject.lastWeekRevenue = adminLastWeekObject[0].lastWeekRevenue;
            }
            callback(err, revenueObject)
        });
    }
    /*This function is used to cal. the total revenue of admin and revenue from last month*/
var adminRevenueForLastMonth = function (callback) {
    var revenueObject = {};
    var oneMonthPrevious = new Date(new Date().setDate(new Date().getDate() - 30));
    domain.Admin_Account_Detail.aggregate([{
        $unwind: "$earning_details"
    }, {
        $match: {
            "earning_details.date": {
                $gt: oneMonthPrevious
            }
        }
    }, {
        $group: {
            _id: "$_id",
            lastMonthRevenue: {
                $sum: "$earning_details.amount"
            },
            totalRevenue: {
                $first: "$total_balance"
            }
        }
    }], function (err, adminAccountObject) {
        //Logger.info(err, "revenu previous month", adminAccountObject)
        if (adminAccountObject.length) {
            revenueObject.lastMonthRevenue = adminAccountObject[0].lastMonthRevenue;
            revenueObject.totalRevenue = adminAccountObject[0].totalRevenue;
        }
        callback(err, revenueObject);
    });
}

/*This function provides the user notification list according to time-stamp */
MoneyService.prototype.getUserNotifications = function (userObj, callback) {

  var date = new Date();
  date.setDate(date.getDate() - 1);
  var isodate = new Date(date).toISOString()
  domain.Notification_History.find({
     $or:[{user_id: userObj._id},{is_send_to_all:true}],
     "createdAt" : {"$gte": isodate}
  }).sort({time_stamp:-1}).lean().exec(function (err, notificatonObject) {
      if(!err){
        return callback(err, SetResponse.setSuccess('notificaton', notificatonObject));
      }else {
        return callback(err,SetResponse.setSuccess("Some error has occurred !"));
      }
  });
    //Logger.info(userObj._id, "control in the get user notification", timestamp);
    // domain.Notification_History.find({
    //     user_id: userObj._id
    // }).sort({time_stamp:-1}).limit(20).exec(function (err, notificatonObject) {
    //     if(!err){
    //       callback(err, SetResponse.setSuccess('notificaton', notificatonObject));
    //     }else {
    //       callback(new Error("Internal Server Error"));
    //     }
    // });

}

var encryptInformation= function(userId,value){
    const cipher = crypto.createCipher('aes192', userId);
    var encrypted = cipher.update(value,'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

 MoneyService.prototype.saveAccountDetails = function(acccountDetailsObj, userId, callback){
 	console.log("service message ",acccountDetailsObj,typeof(acccountDetailsObj.proof_image));
   //Logger.info("control in the saveAccountDetails in money service",userId);
             acccountDetailsObj.acc_no = acccountDetailsObj.acc_no.toString();
             acccountDetailsObj.user = userId;
 		if(acccountDetailsObj.proof_image){
 		   //acccountDetailsObj.proof_image = JSON.parse(acccountDetailsObj.proof_image);
 		}
 	  //  acccountDetailsObj.proof_image = JSON.parse(acccountDetailsObj.proof_image);


 	if(acccountDetailsObj.proof_image === undefined){
                 acccountDetailsObj.proof_image=null;
                 }
 		    domain.User_Account_Details.findOneAndUpdate({
             user:userId,
             deleted:false
             },acccountDetailsObj,
             {new:true},
             function(err,result){
 		console.log("service result  ",result);
 		result = JSON.parse(JSON.stringify(result));
 	/*	if(result.proof_image){
 		result.proof_image = JSON.stringify(result.proof_image);
 		}*/
 	//	result.proof_image = JSON.stringify(result.proof_image);
                 if(result){
 		if(result.proof_image){
                 result.proof_image = JSON.stringify(result.proof_image);
                 }


 //callback(null, SetResponse.setSuccess("", result));
                     callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.accountDetailsUpdate, result));
                 }
                 else if(!err){

                   new domain.User_Account_Details(acccountDetailsObj).save(function(err,obj){
 			console.log("service result  >>>",obj);

                         domain.User.findOneAndUpdate({_id:obj.user,deleted:false},{user_account_details_id:obj._id},function(err,userObject){
 			console.log("service result >> ",userObject);

                         callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.accountDetailsUpdate, obj));
                     })
                 });
             }
         });
 }

MoneyService.prototype.savePaymentInfo = function(acccountDetailsObj, userId, callback){
      // acccountDetailsObj.acc_no = acccountDetailsObj.acc_no.toString();
      // if(acccountDetailsObj.acc_no != null){
      //   acccountDetailsObj.acc_no=encryptInformation(userId,acccountDetailsObj.acc_no);
      // }
      // if(acccountDetailsObj.ifsc_code != null){
      //   acccountDetailsObj.ifsc_code=encryptInformation(userId,acccountDetailsObj.ifsc_code);
      // }
      // if(acccountDetailsObj.pan_card_no != null){
      //   acccountDetailsObj.pan_card_no=encryptInformation(userId,acccountDetailsObj.pan_card_no);
      // }
      acccountDetailsObj.user = userId;
  		if(acccountDetailsObj.proof_image){
  		   acccountDetailsObj.proof_image = JSON.parse(acccountDetailsObj.proof_image);
  		}
    	if(acccountDetailsObj.proof_image === undefined){
        acccountDetailsObj.proof_image=null;
        }
  		domain.User_Account_Details.findOneAndUpdate({
              user:userId,
              deleted:false
              },acccountDetailsObj,
              {new:true},
              function(err,result){
  		        // console.log("service result  ",result);
  		        result = JSON.parse(JSON.stringify(result));
        if(result){
  		if(result.proof_image){
          result.proof_image = JSON.stringify(result.proof_image);
                  }
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.accountDetailsUpdate, result));
          }
     else if(!err){
        new domain.User_Account_Details(acccountDetailsObj).save(function(err,obj){
    		// console.log("service result  >>>",obj);
        domain.User.findOneAndUpdate({_id:obj.user,deleted:false},{user_account_details_id:obj._id},function(err,userObject){
    		// console.log("service result >> ",userObject);
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.accountDetailsUpdate, obj));
      })
    });
  }
});
}

module.exports = function (app) {
    return new MoneyService(app);
};
