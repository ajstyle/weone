module.exports = function () {
/*
this controller is used to
approve and disapprove advertiser module
module activity and advertisements
*/
var getAdvertiser = function(req,res,callback){
  console.log(" control inside getting weone advertisers");
  this.services.advertiserService.getAdvertisersList(callback);
}
var updateAdvertiserStatus= function(req,res,callback){
   var approvalStatus= req.params.userId;
   this.services.advertiserService.updateAdvertiserStatus(approvalStatus,callback);
 }
 var updateAdvertiserStatusRejected= function(req,res,callback){
   var approvalStatus= req.params.userId;
   this.services.advertiserService.updateAdvertiserStatusRejected(approvalStatus,callback);
 }
 var getActivityList = function(req,res,callback){
   console.log(" control inside getting activity list ");
   this.services.advertiserService.getAdvertisersActivityList(callback);
 }
 var approveActivity= function(req,res,callback){
    var activityId = req.params.userId;
    console.log("activity data is ", activityId);
    this.services.advertiserService.approveActivity(activityId,callback);
  }


return {
  getAdvertiser:getAdvertiser,
  updateAdvertiserStatus:updateAdvertiserStatus,
  updateAdvertiserStatusRejected:updateAdvertiserStatusRejected,
  getActivityList:getActivityList,
  approveActivity:approveActivity
}
};
