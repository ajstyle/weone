var BaseService = require('./BaseService');
var AuthenticationService = require('./common/AuthenticationService').AuthenticationService;
var MLMService = require('./MLMService');
ReferralService = function (app) {
    this.app = app;
};
ReferralService.prototype = new BaseService();

/*
It will provide the network status of MLM upto 10 levels.It will information of bottom of tree user ie name of user,balance in his
account. and This information commes from jobs and store history in document(User_Network_details)
*/

ReferralService.prototype.verifyRefferalCode = function(mobileNumber,referredId, callback){
  referredId = referredId.toLowerCase();
  domain.User.findOne({referralId:referredId,deleted:false},function(err,res){
    // Logger.info("the detail is",mobileNumber,referredId,err);
    // Logger.info("res is here ",res)
    if(!err){
      if(res){

      domain.User.update({phonenumber:mobileNumber},{$set:{inviter:res._id,role:'ROLE_USER'}},function(err,result){
              if(!err){
                //Logger.info("the response is",result);
                callback(err, SetResponse.setSuccess("The Referral-Id has been verified successfully",{isReferralIdVerified:true}));
              }else {
                callback(err,SetResponse.setSuccess("Some error has occurred !"));
              }
        })




        // async.auto({
        //   generateReferralId: function(next,results){
        //     return generateReferralIds(next);
        //   },
        //   updateTheUser: ['generateReferralId',function(next, results){
        //     domain.User.update({phonenumber:mobileNumber},{$set:{inviter:res._id,referralId:results.generateReferralId}},function(err,result){
        //       if(!err){
        //         Logger.info("the response is",result);
        //         callback(err, SetResponse.setSuccess("The Referral-Id has been verified successfully",{isReferralIdVerified:true}));
        //       }else {
        //         callback(new Error("Internal Server Error"));
        //       }
        //     })
        //   }]
        // },function(error,results){
        //   Logger.info("done");
        // })
      }else {
        callback(err, SetResponse.setSuccess("Sorry!! This Referral-Id does not exists.",{isReferralIdVerified:false}));
      }
    }
  })
}

ReferralService.prototype.getInviterByReferredId = function(referredId, callback){
  domain.User.findOne({referralId:referredId},function(err,res){
    if(!err){
      if(!res){
        var response = {};
        response.inviterObj = res;
        response.referralId = referralId;
        return response;
      }else {
        callback(err, SetResponse.setSuccess("Sorry!! This Referral-Id does not exists."));
      }
    }
  })
}

ReferralService.prototype.addUserWithReferralId = function (userObj,callback) {
  //Logger.info("Inside invite status change",userObj.phonenumber);
    domain.User.find({
        deleted:false,
        _id:userObj.inviter
        //user_invite_people: userObj.phonenumber
    }, {_id:1},function (err, userObjects) {
      //Logger.info("first fn",err, userObj, userObjects);
        if (userObjects.length>0) {
            //Logger.info("Inside userObjects if",userObjects.length);
            var inviterUserList = []
            inviterUserList.push(userObjects[0]._id)
            updateInviterList(userObjects[0]._id,userObj.phonenumber);
            domain.User.findOneAndUpdate({
                _id: userObjects[0]._id
            }, {
                $inc: {
                    user_invited_people_count: 1
                }
            }, function (err, result) {
              //Logger.info("the res s",result);
                if (result) {
                  //Logger.info("the res s",result);
                    ////Logger.info.info("Count increment in user_invite_people and inviter set");
                    // inviter = result;
                    AuthenticationService.generateAuthenticationToken(userObj, callback);
                    // it will add the user object in to mlm
                    // MLMService.createUserNode(userObj,result);
                    MLMService.createUserNodeV3(userObj,result);
                }
            })

        }else{
          callback(err, SetResponse.setSuccess("Inviter does not exists"));
        }
    });
}

ReferralService.prototype.generateReferralIdsScript = function(callback){
  domain.User.find({role:"ROLE_USER"},function(err, result){
    if(!err){
      result.forEach(function(user){
        async.auto({
          generateTheReferralId:function(next,results){
            return ReferralService.prototype.generateReferralIds(next);
          },
          updateUsers:['generateTheReferralId',function(next,results){
            //Logger.info("Inside update users",results,user.phonenumber);
            domain.User.update({'_id':user._id},{$set:{'referralId':results.generateTheReferralId}},function(err, res){
              if(!err){
                //Logger.info("The updation done successfully",res,results.generateTheReferralId);
                next(null);
              }else {
                //Logger.info("Some error");
              }
            })
          }]
        },function(error,results){
            //Logger.info("updation done");
        })
      })
      callback(err, SetResponse.setSuccess("Referral-Ids generated successfully"));
    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })
}

ReferralService.prototype.generateReferralIds = function(superNext){
  //Logger.info("inside generation");
  var text = "";
  // var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var possible = "qwertyuioplkjhgfdsazxcvbnm0123456789";
  var flag = false;
  async.auto({
    step1: function(next, results){
      do{
        for( var i=0; i < 5; i++ ){
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        domain.User.count({referralId:text},function(err,count){
          if(count>0){
            flag = true;
          }else {
            flag = false;
            next(null);
          }
        })
      }while(flag)
    }
  },function(err, result){
    //Logger.info("the generated id is",text);
      superNext(null,text)
      //return text;
  })
}

var updateInviterList = function(inviterId,phonenumber){
  domain.User.findOne({_id:inviterId,user_invite_people:phonenumber},function(err,res){
    if(!err){
      if(!res){
        domain.User.update({_id:inviterId},{$push:{user_invite_people:phonenumber}},function(err,user){
          //Logger.info("the resp is",err,user);
          if(!err){
            //Logger.info("pushed the mobile no successsfully in the inviter's invite list");
          }else {
            //Logger.info("Some error",err);
          }
        })
      }
    }
  })
}

ReferralService.prototype.getAndUpdateReferralIdsScript=function(callback){

  domain.User.find({deleted:false,role:'ROLE_USER'},function(err,users){
    // Logger.info("length is ",users.length);
    for (var i = 0; i < users.length; i++) {
         var referralId=users[i].referralId;
         var lowerCase=users[i].referralId.toLowerCase();
         domain.User.update({'referralId':users[i].referralId,deleted:false,role:'ROLE_USER'},{$set:{'referralId':lowerCase}},function(err,updatedUsers){
        //  Logger.info("updated users are",updatedUsers);
      })
    }
    callback(err, SetResponse.setSuccess("Referral-Ids updated successfully"));
  })
}

module.exports = function (app) {
    return new ReferralService(app);
};
