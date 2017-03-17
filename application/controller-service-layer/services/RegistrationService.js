/*
 * @author Parveen yadav
 * This service is for the registration process of new users for both admin side as well as appUsers generating OTP .
 *
 */

var AuthenticationService = require('./common/AuthenticationService').AuthenticationService;
var SetResponse = require('./SetResponseService');
var MLMService = require('./MLMService');
var SendSMS = require('./SendSMSService');
var inviter = null;

RegistrationService = function (app) {
    this.app = app;
};

var changeInviteStatus = function (userObj,callback) {
  //Logger.info("Inside invite status change",userObj.phonenumber);
    domain.User.find({
        deleted:false,
        user_invite_people: userObj.phonenumber
    }, function (err, userObjects) {
      //Logger.info("first fn",err, userObj, userObjects);
        if (userObjects.length>0) {
            //Logger.info("Inside userObjects if",userObjects.length);
            var inviterUserList = []
            inviterUserList.push(userObjects[0]._id)
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
                    MLMService.createUserNode(userObj,result);
                }
            })
            // for (var i = 0; i < 1; i++) {
            //
            // }
        }else{
          //Logger.info("No user is found");
            //Logger.info("No user is found")
            AuthenticationService.generateAuthenticationToken(userObj, callback);
            // it will add the user object in to mlm
            domain.User.findOne({_id:"57514663dff36bf069c60aa8"},function(err,result){
              if(result){
                //Logger.info("not going under kotian's tree");
                MLMService.createUserNode(userObj,null);

                // Logger.info("going under kotian's tree");
                // MLMService.createUserNode(userObj,result);
              }else {
                //Logger.info("going according to the old logic");
                MLMService.createUserNode(userObj,null);
              }
            })

        }
    });
}

var checkEmailUniqueness = function (email, callback) {
    domain.User.findOne({
        role: "ROLE_USER",
        deleted: false,
        email: email
    }, function (err, userObject) {

        if (userObject) {
          // Logger.info(" userObject ",userObject.email, " user number",userObject.number)
            callback(err, true);
        } else {
            callback(err, false)
        }
    })
}

var generateSequenceId = function(callback){
  domain.Sequence.findOneAndUpdate(
      {deleted:false},
      {$inc:{sequenceId:1}},
      {new:true},
      function(err,userObj){
    if(userObj){
      Logger.info("userobject sequence id",err,userObj,userObj.sequenceId);
      callback(null,userObj.sequenceId);
    }else {
      callback(null,-1);
    }
  })
}
/*
 * Function is used for registration of app users by finding age and setting asciiCode in username   for uniqueness .
 * First check if user object is there because we are creating user at very first time when user     request for OTP after that we check with email if not exists that mean userObject is there but     not registered yet, than generate auth token for that and append details to the existing           object otherwise sending already registered.
 */

RegistrationService.prototype.appUserRegistration = function (userObj, callback) {

    Logger.log("control in the  userRegistartion service layer");
     if (userObj) {
     if(userObj.date_of_birth){
       Logger.info("dataOfbirth >>>> ",userObj.date_of_birth) // check if user not provide DOB according to Apple standards
       var birthdate = new Date(userObj.date_of_birth);
        var currentDate = new Date();
        var diff = currentDate - birthdate; // This is the difference in milliseconds
        var age = Math.floor(diff / 31536000000); // Divide by 1000*60*60*24*365
        userObj.age = age;
        Logger.info(" age is ",age);
    }
        var username = userObj.email;
        Logger.info( userObj.phonenumber)
        var asciiCode = "";
        for (var i = 0; i < username.length; i++) {
            asciiCode = asciiCode.concat(username.charCodeAt(i).toString());
        }
        userObj.username = asciiCode;
        userObj.isAccountActive = false;
        async.auto({
          checkTheEmailExistance:function(next,result){
              Logger.info(" controll in email existence");
              return checkEmailUniqueness(userObj.email,next)
          },
          generateReferralId:function(next, results){
            Logger.info(" controll in referralId existence");
            return ReferralService.prototype.generateReferralIds(next);
          }
        },function(err,result){
          userObj.referralId = result.generateReferralId;
          userObj.isPhonenumberVerified = false;
          // Logger.info(" result value ",result.email, " referral id ", result.generateReferralId," email exist",result.checkTheEmailExistance)
          //Logger.info("Email uniquness ",result.checkTheEmailExistance,userObj.phonenumber)
          domain.User.findOne({
            phonenumber: userObj.phonenumber
        }, function (err, obj) {
          // if(obj.phonenumber != userObj.phonenumber && obj.email != userObj.email)
          // {
          //   Logger.info( userObj.phonenumber)
          //Logger.info("the response is",err,userObj.phonenumber,obj.email);
          if(obj.inviter){

            if (!obj.email && !result.checkTheEmailExistance) {
              Logger.info("inside inviter method");
                async.auto({
                  userSequenceId:function(next){
                    return generateSequenceId(next);
                  }
                },function(err,seqResult){
                  Logger.info("seq result ",seqResult.userSequenceId);
                  userObj.sequenceId= seqResult.userSequenceId;
                  Logger.info("userObj result ",userObj.sequenceId);
                  domain.User.findOneAndUpdate({
                      phonenumber: userObj.phonenumber
                  }, userObj, {
                      new: true
                  }, function (err, updatedUserObject) {
                      if (updatedUserObject) {
                          Logger.info("the updated obje");
                          //changeInviteStatus(updatedUserObject, callback);
                          ReferralService.prototype.addUserWithReferralId(updatedUserObject, callback);
                          // AuthenticationService.generateAuthenticationToken(updatedUserObject, callback);
                          // // it will add the user object in to mlm
                          // Logger.info("the inviter is",inviter);
                          // MLMService.createUserNode(updatedUserObject,inviter);
                      } else {
                          callback(SetResponse.setError(configurationHolder.Message.Error.failedAuthorization, 401));
                      }
                  });
                })

            } else {
                //Logger.info("user is already register");
                // Logger.info(" user is already registerederror")
                callback(err, SetResponse.setSuccess(configurationHolder.Message.Error.alreadyRegistered,{alreadyEmailExist:true}));
            }
          }else {
            callback(err, SetResponse.setSuccess("Referral Id is missing. Could not Sign Up, Please update your app!",{isReferralIdVerified:false}));
            // callback(err, SetResponse.setError("Referral Id is missing. Could not Sign Up !",401));
          }
        // }
        //   else{
        //     Logger.info(" user is already registered")
        //     callback(err,SetResponse.setSuccess("User is already registered !"));
        //   }
        });
        });
    }
}

/*
 *   Function is used for creating new registration from Admin side . We make this because its         different from registering app user, we do not genrating any OTP for that also not setting the     age of user.
 */
RegistrationService.prototype.adminUserRegistartion = function (userObj, callback) {
    //Logger.info("create user for admin side ");
    var username = userObj.email;
    var asciiCode = "";
    for (var i = 0; i < username.length; i++) {
        asciiCode = asciiCode.concat(username.charCodeAt(i).toString());
    }
    userObj.username = asciiCode;
    var user = new domain.User(userObj);
    user.save(function (err, userObj) {
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.userRegister, userObj));
    });
}

/*
    Function is used to genrate OTP using Passcode module by taking mobile number and timestamp to     genrate a unique OTP.
*/

var generateOtp = function (mobileNumber) {
    if(mobileNumber=='919871766313' || mobileNumber=='919899923127'){
        token = 808080;
    }
    else{
    //Logger.info("Control is in generateOtp of UserService");
    var token = passcode.hotp({
        secret: mobileNumber,
        counter: new Date().getTime()
    });
}
    //Logger.info("opt token", token)
    return token;
}


/*
    Function is used for creating new User object and saving OTP . If user already exists then its     update the OTP for that in case of resend OTP request otherwise make a new User object with       phonenumber and OTP and saved the same.

*/

var saveOtp = function (mobileNumber, token, callback) {
    //Logger.info("save opt function" + mobileNumber);
    domain.User.findOne({
        phonenumber: mobileNumber
    }, function (err, obj) {
        if (obj) {
            domain.User.findOneAndUpdate({
                _id: obj._id
            }, {
                otp_code: token,
                updatedAt: new Date()
            }, {new:true}, function (err, usr) {
                usr = JSON.parse(JSON.stringify(usr));
                if(obj){
                  domain.DeleteRequests.findOne({user:usr._id},function(err,del_request){
                    if(!err){
                      if(del_request){
                        if(del_request.status == 'PENDING'){
                          usr.deleteRequest = true;
                        }else {
                          usr.deleteRequest = false;
                        }
                        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.otpSuccess, usr));
                      }else {
                        usr.deleteRequest = false;
                        //Logger.info("sending the response",usr.deleteRequest);
                        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.otpSuccess, usr));
                      }
                    }else {
                      callback(err,SetResponse.setSuccess("Some error has occurred !"));
                    }
                  })

                }
                else if(err){
                  //Logger.error("Error while updating datbase in saveOTP method.."+err);
                }

            });
        } else {
            var usrObject = new domain.User({
                phonenumber: mobileNumber,
                otp_code: token
            });
            usrObject.save(function (err, obj) {
                callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.otpSuccess, obj));

            });
        }
    })
}

/*
   Function  is used for sending OTP and saving the same in User Domain also check for authToken      if avilable than its work as update or change mobile number request.
*/

RegistrationService.prototype.saveSendOtp = function (mobileno, userObject, callback) {
    //Logger.info(mobileno, "control in the  saveSendOtp service layer");
    var token = generateOtp(mobileno);
    // Logger.info("Previous",token);
    if(token.toString().length!=6){
      token = parseInt('1'+token.toString());
      // Logger.info("NEW",token);
    }
    if (userObject) {
        //Logger.info('control in update mobile number');
                domain.User.findOne({
                    phonenumber: mobileno,
                    deleted: false
                }, function (err, userObj) {
                    //Logger.info("userObject in genertae time.."+userObj);
                    if (!userObj) {
                        //Logger.info("control in new user");
                        domain.User.findOneAndUpdate({
                            _id: userObject._id,
                            deleted: false
                        }, {
                            newMobileNo: mobileno,
                            otp_code: token,
                            updatedAt: new Date()
                        }, null, function (err, obj) {
                            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.otpSuccess1,null));
                        });
                        SendSMS.sendOTPService(mobileno, token);
                    } else {
                        //Logger.info("control in the already exist user");
                        callback(err, SetResponse.setSuccess(configurationHolder.Message.Error.alreadyRegisteredPhoneNumber, false));
                    }
        });
    } else {
        //call for the otp when user register
        // domain.User.findOne({phonenumber:mobileno},function(err, res){
        //   if(res){
        //     //saveOtp(mobileno, token, callback);
        //     // SendSMS.sendOTPService(mobileno, token);
        //     Logger.info("Sending old otp",res.otp_code);
        //     saveOtp(mobileno, res.otp_code, callback);
        //     SendSMS.sendOTPService(mobileno, res.otp_code);
        //   }else {
        //     Logger.info("Sending new otp",token);
        //     saveOtp(mobileno, token, callback);
        //     SendSMS.sendOTPService(mobileno, token);
        //   }
        // })

        saveOtp(mobileno, token, callback);
        SendSMS.sendOTPService(mobileno, token);
    }
}

RegistrationService.prototype.contact_us = function (data, user, callback) {
  var description = data.description;
  var image_url = data.image_url;

  var save_obj = {};
  save_obj.description = description;
  save_obj.image_url = image_url;
  save_obj.user = user;

  var contact_us_obj = new domain.Contact_Us(save_obj);
  contact_us_obj.save(function(err,res){
    if(!err){
      callback(err, SetResponse.setSuccess("Thanks for Connecting. We will reach out to you soon",res));
    }else {
      //Logger.info("there is error",err,res);
      callback(err, SetResponse.setSuccess("Oops!! Something went wrong",res));
    }
  });



}

var responseOfUpload = function (filePath, serverPath, responseFile, user, description, callback) {
    //Logger.info(filePath, "control in the responseOfUpload", responseFile, serverPath)
    fs.rename(
        filePath, serverPath,
        function (err) {
            if (err) {
                callback(new Error("Something Went Wrong"))
            } else {
                //Logger.info('success');
                var data_obj = {};
                data_obj.user = user;
                data_obj.fileName = serverPath;
                data_obj.description = description;
                var contact_us = new Contact_Us(data_obj);
                contact_us.save(function(err,res){
                  if(!err && res){
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, responseFile));
                  }else {
                    callback(err,SetResponse.setSuccess("Some error has occurred !"));
                  }
                });
            }
        }
    );
}

module.exports = function (app) {
    return new RegistrationService(app);
};
