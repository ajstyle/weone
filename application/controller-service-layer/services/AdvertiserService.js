var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
var AuthenticationService = require('./common/AuthenticationService').AuthenticationService;
AdvertiserService = function (app) {
    this.app = app;
};
AdvertiserService.prototype = new BaseService();
AdvertiserService.prototype.getAdvertisersList = function (callback){
  var totalAdvertisers = {};
  domain.Advertiser.find({deleted:false, role:"ROLE_ADVERTISER","approve_status.approved":false,"approve_status.rejected":false},function(err,response){
    if(response != null ){
      domain.Advertiser.count({deleted:false,role:"ROLE_ADVERTISER","approve_status.approved":false},function(err,countResult){
        totalAdvertisers.object = response;
        totalAdvertisers.count = countResult;
        console.log(" control inside advertiser list service ",countResult);
        callback(null, SetResponse.setSuccess("Advertiser list fetched successfully",totalAdvertisers));
      })
    }else{
      console.log("error occured in getting advertiser list ");
      callback(err,SetResponse.setSuccess(" Error occured in getting advertiser list "));
    }
  })
}
AdvertiserService.prototype.updateAdvertiserStatus=function(approveStatus,callback){
  console.log(" search field is ",mongoose.Types.ObjectId(approveStatus.toString()));

    domain.Advertiser.findOneAndUpdate(
      {_id:approveStatus,deleted:false,role:"ROLE_ADVERTISER"},{$set:{"approve_status.approved":true}},{new:true},function(err,response){
      if(!err && response){
        console.log("response is ", response);
        callback(null,SetResponse.setSuccess("Approve status changed succesfully ",response));
      }else{
        callback(err, SetResponse.setSuccess("error occurred while updating list "));
      }
      })
}
AdvertiserService.prototype.updateAdvertiserStatusRejected=function(approveStatus,callback){
    console.log(" search field is ",approveStatus);
      domain.Advertiser.findOneAndUpdate(
        {_id:approveStatus,deleted:false,role:"ROLE_ADVERTISER"},{$set:{"approve_status.rejected":true}},function(err,response){
        if(!err && response){
          console.log("response is ", response);
          callback(null,SetResponse.setSuccess("Approve status changed succesfully ",response));
        }else{
          callback(err, SetResponse.setSuccess("error occurred while updating list "));
        }
        })
  }
  AdvertiserService.prototype.getAdvertisersActivityList = function (callback){
    var totalActivity = {};
    domain.Activity.find({deleted:false,"approve_status.approved":false,"approve_status.rejected":false},function(err,response){
      if(response != null ){
        domain.Activity.count({deleted:false,"approve_status.approved":false},function(err,countResult){
          totalActivity.object = response;
          totalActivity.count = countResult;
          console.log(" control inside advertiser list service ",countResult);
          callback(null, SetResponse.setSuccess("Advertiser's activity list fetched successfully",totalActivity));
        })
      }else{
        console.log("error occured in getting advertiser list ");
        callback(err,SetResponse.setSuccess(" Error occured in getting advertiser activity list "));
      }
    })
  }
AdvertiserService.prototype.approveActivity=function(activityId,callback){
  if(activityId != null){
    domain.Activity.findOneAndUpdate({_id:activityId},{$set:{"approve_status.approved":true}},function(err,results){
      if(!err && results != null){
        callback(null,SetResponse.setSuccess(" Total Activities ",results));
      }else{
        callback(err,SetResponse.setSuccess("Error occurred while updating activity"));
      }
    });
  }else{
    callback(err,SetResponse.setSuccess(" Activity Id is not found ! "));
  }
}

module.exports = function (app) {
return new AdvertiserService(app);
};
