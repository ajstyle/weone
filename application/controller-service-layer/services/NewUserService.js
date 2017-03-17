var BaseService = require('./BaseService');

NewUserService = function (app) {
    this.app = app;
};

NewUserService.prototype.verifyPincode = function(params, callback){
  var pincode = parseInt(params.pincode);
  domain.Pincode.find({pincode:pincode},function(err,pinObj){
    if(pinObj.length>0){
      callback(err, SetResponse.setSuccess("Pincode Successfully Verified", {success:true,pinObj:pinObj}));
    }else {
      callback(err, SetResponse.setSuccess("Sorry this Pincode doesn't exists in the database.", {success:false}));
    }
  })

}

module.exports = function (app) {
    return new NewUserService(app);
};
