var BaseService = require('./BaseService');
var AuthenticationService = require('./common/AuthenticationService').AuthenticationService;
var SendSMS = require('./SendSMSService');

UserSessionService = function (app) {
    this.app = app;
};

UserSessionService.prototype = new BaseService();

UserSessionService.prototype.generateOTP = function(phonenumber,callback){
  async.auto({
    generate_token:function(next, result){
      get_token(phonenumber,next);
    },
    save_otp:['generate_token',function(next, result){
      var otp = result.generate_token;
      save_generated_otp(phonenumber,otp,next);
    }],
    send_otp:['save_otp',function(next, result){
      var otp = result.generate_token;
      SendSMS.send_otp(phonenumber, otp);
      next(null);
    }]
  },function(err,results){
    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.otpSuccess, results.save_otp));
  })
}

UserSessionService.prototype.verifyOTP = function(req,callback){
  // Logger.info("the req is",req);
  async.auto({
    isOTPVerified:function(next,result){
      verify_otp(req,next);
    },
    isUserRegistered:['isOTPVerified',function(next,result){
      // Logger.info("the step 2",result);
      if(result.isOTPVerified.isVerified){
        verify_user_registration(result.isOTPVerified.userObj,next);
      }else {
        next(null,false);
      }
    }],
    updateDeviceToken:['isOTPVerified',function(next,result){
      if(result.isOTPVerified.isVerified){
        domain.User.update({phonenumber:req.phonenumber},{$set:{
          registration_token:req.registration_token,
          app_platform:req.app_platform
        }},function(err,resp){
          // Logger.info("Updated the registration_token");
          next(null,{success:true})
        })
      }else {
        next(null,false);
      }
    }],
    createResponse:['isUserRegistered',function(next,result){
      // Logger.info("the step 3",result);
      if(result.isOTPVerified.isVerified){
        if(result.isUserRegistered){
          generateAuthToken(result.isOTPVerified.userObj,next);
        }else {
          next(null);
        }
      }else {
        next(null);
      }
    }],
    getDeleteRequestStatus:['createResponse',function(next,result){
      if(result.isUserRegistered){
        getDeleteRequest(result.isOTPVerified.userObj,next);
      }else {
        next(null,false)
      }
    }]
  },function(err,results){
    if(results.isOTPVerified.isVerified){
      if(results.isUserRegistered){
        var resObj = {
          authToken:results.createResponse,
          user:results.isOTPVerified.userObj,
          OTPMatched:true,
          deleteRequest:results.getDeleteRequestStatus,
          isUserRegistered:true
        }
        callback(err, SetResponse.setSuccess("OTP Verified Successfully", resObj));
      }else {
        var resObj = {
          user:results.isOTPVerified.userObj,
          OTPMatched:true,
          deleteRequest:results.getDeleteRequestStatus,
          isUserRegistered:false
        }
        callback(err, SetResponse.setSuccess("OTP Verified Successfully", resObj));
      }
    }else {
      var resObj = {
        user:results.isOTPVerified.userObj,
        OTPMatched:false,
        deleteRequest:results.getDeleteRequestStatus,
        isUserRegistered:false
      }
      callback(err, SetResponse.setSuccess("Sorry OTP can't be matched", resObj));
    }
  })
}

UserSessionService.prototype.deviceDetails = function(user_id,req,callback){
  domain.User_Device_Details.findOneAndUpdate({user_id:user_id},{device_info:req},function(err,result){
    if(result){
      callback(err, SetResponse.setSuccess("User Device Details Updated Successfully"));
    }else {



      var userDeviceObj={};

       userDeviceObj = new domain.User_Device_Details({device_info:req});
      userDeviceObj.user_id=user_id;
      userDeviceObj.save(function(err,result){
        if(!err){
          callback(err, SetResponse.setSuccess("User Device Details Saved Successfully"));
        }else {
          callback(err, SetResponse.setSuccess("Some error occured",{message:err}));
        }
      })
    }
  })
}

UserSessionService.prototype.userInfo = function(user, callback){
  async.auto({
    getUserDetails:function(next,result){
      createUserResponse(user,next);
    },
    getNotifications:function(next,result){
      getUserNotifications(user,next);
    },
    getUnseenVideoCount:function(next,result){
      getNewMediaCount(user,next);
    },
    updatePhoneVerifyFlag:function(next,result){
      console.log("Updating ph no");
      domain.User.update({phonenumber:user.phonenumber},{isPhonenumberVerified:false},function(err,res){
        if(!err){
          next(null);
        }else {
          console.log("Some error in updating the ph verified",err);
          next(null);
        }
      })
    }
  },function(err,results){
    // Logger.info("the results are",err,results);
    if(results.getUserDetails.success && results.getNotifications.success && results.getUnseenVideoCount.success){
      var resObj = {};
      resObj.userHome = results.getUserDetails.userHome;
      resObj.notificatons = results.getNotifications.notificationObj;
      resObj.newMediaCount = results.getUnseenVideoCount.unseenCount;
      resObj.success = true
      return callback(null, SetResponse.setSuccess("The User Info is fetched Successfully", resObj));
    }else {
      var resObj = {
        success:false
      }
      return callback(null, SetResponse.setSuccess("Some error occured in fetching the data", resObj));
    }

  })
}

var getNewMediaCount = function(userObj,next){
  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }
  domain.Advert.find({
      deleted: false,
      $or: [{
        gender: userObj.gender
            }, {
        gender: 'both'
            }],
      advert_status: 'ready',
      "schedule.end_date": {
        $gte:todaydate
          // $gte: new Date().setHours(18,30,0,0)
      },
      "schedule.start_date": {
        $lte:todaydate
          // $lte: new Date().setHours(18,30,0,0)
      }
  }, {
      _id: 1
  }).lean().exec(function (err, adverts) {
      var newAdvertismentIds = adverts.map(function(advert){
        return advert._id;
      })

      domain.Ad_View_History.count({
            complete_view: true,
            ad_id: {
                $in: newAdvertismentIds
            },
            "userView._id": userObj._id
        }).exec(function (err, seenAdvertisementsCount) {
          if(!err){
            var unseenCount = adverts.length - seenAdvertisementsCount;
            var resObj = {
              unseenCount:unseenCount,
              success:true
            }
            return next(null, resObj);
          }else {
            var resObj = {
              unseenCount:0,
              success:false
            }
            return next(null, resObj);
          }

        });

  });
}

var getUserNotifications = function(userObj,next){
  var date = new Date();
  date.setDate(date.getDate() - 1);
  var isodate = new Date(date).toISOString()
  domain.Notification_History.find({
     $or:[{user_id: userObj._id},{is_send_to_all:true}],
     "createdAt" : {"$gte": isodate}
  }).sort({time_stamp:-1}).lean().exec(function (err, notificatonObject) {
      if(!err){
        var resObj = {
          notificationObj:notificatonObject,
          success:true
        }
        return next(null, resObj);
      }else {
        var resObj = {
          success:false
        }
        return next(null,resObj);
      }
  });
}

var createUserResponse = function(usrObject, next){
  var resultObject = {};
  var userObjRes = {
    _id:usrObject._id,
    read_recepit_status:usrObject.read_recepit_status,
    view_profile_status:usrObject.view_profile_status,
    last_seen_status:usrObject.last_seen_status,
    notification_status:usrObject.notification_status,
    phonenumber:usrObject.phonenumber,
    email:usrObject.email,
    gender:usrObject.gender,
    date_of_birth:usrObject.date_of_birth,
    name:usrObject.name,
    image_url:usrObject.image_url,
    sequenceId:usrObject.sequenceId,
    userPin:usrObject.userPin,
    location:usrObject.location
  }
  var totalAmtAvilable = usrObject.user_account.wallet.wallet_amount_available.toFixed(2);
  domain.User.count({inviter:usrObject._id}).exec(function(err,res){
     //Logger.info("the user is",err,res.user_invite_people);
     if(!err){
       if(usrObject.user_invited_people_count>=2){
         resultObject.networkStatus = true;
       }else {
         resultObject.networkStatus = false;
       }
       resultObject.totalImageView = 0;
       resultObject.totalAmtAvilable = totalAmtAvilable;
       resultObject.totalCompleteVideoView = 0;
       resultObject.referralId = usrObject.referralId;
       resultObject.userObject = userObjRes;
       var resObj = {
         userHome:resultObject,
         success:true
       }
       return next(null,resObj);
     }else {
       resultObject.success = false;
       return next(null,resultObject);
     }
   });
}

var getDeleteRequest = function(userObj,next){
  domain.DeleteRequests.findOne({user:userObj._id},function(err,del_request){
    if(!err){
      if(del_request){
        if(del_request.status == 'PENDING'){
          next(null,true);
        }else {
          next(null,false);
        }
      }else {
        next(null,false);
      }
    }else {
      next(null,false)
    }
  })
}

var verify_user_registration = function(userObj,next){
  var role = userObj.role;
  if(role=='ROLE_USER'){
    next(null, true)
  }else {
    next(null, false)
  }
}

var generateAuthToken = function(userObj,next){
  // uuid.v1()
  domain.Authentication_Token.findOneAndUpdate(
    {user:userObj._id},
    {authToken:uuid.v1()},
    {new:true},
    function(err,result){
      if(!err && result){
        next(null,result.authToken)
      }else {
        var authenticationObj = new domain.Authentication_Token({
            email: userObj.email,
            user: userObj._id,
            authToken: uuid.v1()
        })
        authenticationObj.save(function (err, result){
          next(null,result.authToken)
        })
      }
    })
}

var verify_otp = function(reqObj,next){
  // Logger.info("inside verify otp",reqObj);
  domain.User.findOne({
    phonenumber:reqObj.phonenumber,
    otp_code:reqObj.otp
  },function(err,res){
    // Logger.info("the res is",err,res);
    if(!err && res){
      // Logger.info("if");
      var resObj = {
        userObj:res,
        isVerified:true
      }
      next(null,resObj)
    }else {
      // Logger.info("else");
      var resObj = {
        userObj:{},
        isVerified:false
      }
      next(null,resObj)
    }
  })
}

var save_generated_otp = function(phonenumber, otp, callback){
  domain.User.count({phonenumber:phonenumber},function(err,count){
    if(!err){
      if(count!=0){
        save_old_user_otp(phonenumber,otp,callback);
      }else {
        create_user_and_save_otp(phonenumber,otp,callback);
      }
    }else {
      callback(null,{success:false});
    }
  })
}

var save_old_user_otp = function(phonenumber, otp, callback){
  domain.User.findOneAndUpdate({
    phonenumber:phonenumber},{
      otp_code:otp,
      updatedAt: new Date()
    },{new:true},function(err,res){
    if(!err){
      callback(null,{success:true,userObj:res});
    }else {
      callback(null,{success:false,userObj:null});
    }
  })
}

var create_user_and_save_otp = function(phonenumber, otp, callback){
  var userObj = new domain.User({
      phonenumber: phonenumber,
      otp_code: otp
  });
  userObj.save(function (err, res) {
    if(!err){
      callback(null,{success:true,userObj:res});
    }else {
      callback(null,{success:false,userObj:null});
    }
  });
}

var get_token = function (mobileNumber,callback) {
  if(mobileNumber=='919871766313' || mobileNumber=='919899923127'){
      token = 808080;
  }
  else{
    var token = passcode.hotp({
        secret: mobileNumber,
        counter: new Date().getTime()
    });
  }
  callback(null,token);
}

UserSessionService.prototype.createUserPin = function(userObj, pin, callback){
  if(pin.replace(/[^0-9]/g,"").length == 4){
    domain.User.update({_id:userObj._id},{$set:{userPin:parseInt(pin).toString()}},function(err,res){
      if(!err){
        return callback(null, SetResponse.setSuccess("Successfully created the Pin", {success:true}));
      }else {
        return callback(null, SetResponse.setSuccess("There is some error in creating the Pin", {success:false,errorMsg:err}));
      }
    })
  }else {
    return callback(null, SetResponse.setSuccess("There is some error in creating the Pin", {success:false,errorMsg:"Invalid PIN"}));
  }
}

UserSessionService.prototype.updateUserPin = function(userObj, pin, callback){
  if(pin.replace(/[^0-9]/g,"").length == 4){
    domain.User.update({_id:userObj._id},{$set:{userPin:parseInt(pin).toString()}},function(err,res){
      if(!err){
        return callback(null, SetResponse.setSuccess("Successfully Updated the Pin", {success:true}));
      }else {
        return callback(null, SetResponse.setSuccess("There is some error in updating the Pin", {success:false,errorMsg:err}));
      }
    })
  }else {
    return callback(null, SetResponse.setSuccess("There is some error in updating the Pin", {success:false,errorMsg:"Invalid PIN"}));
  }
}

UserSessionService.prototype.likeUnlike = function(userObj, params, callback){
  var flag = params.flag;
  var entry_id = params.entryid;

  domain.Advert.findOne({
      "fileInformation.entry_id": entry_id
  },{_id:1,client_details:1,cost_per_view:1,advert_type:1,fileInformation:1}).lean().exec(
    function (err, advertObject) {
      domain.Like_History.count({
          ad_id: advertObject._id,
      }).exec(function (err, likeHistroyObject) {
          if (likeHistroyObject>0) {
              if(flag == 'true'){
                likeTheAdvertisement(advertObject._id, userObj._id, entry_id, callback);
              }else if(flag == 'false'){
                dislikeTheAdvertisement(advertObject._id, userObj._id, entry_id, callback);
              }else {
                return callback(null, SetResponse.setSuccess("Invalid flag", {success:false}));
              }
          } else {
              createNewBucketForLikes(advertObject._id, userObj._id, callback);
          }
      });
  });
}

var likeTheAdvertisement = function(ad_id, user_id, entry_id, callback){
  domain.Like_History.update({
    ad_id:ad_id},
    {$addToSet:{like_by_users:user_id}},function(err,resObj){
      if(resObj.nModified==0){
        domain.Advert.findOne({
                "fileInformation.entry_id": entry_id
            },
            function (err, object) {
              // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
              if(!err){
                return callback(err, SetResponse.setSuccess("Already Liked", {
                    success:true,
                    number_of_likes: object.number_of_likes,
                    entry_id: object.fileInformation.entry_id,
                    likeFlag: true
                }));
              }else {
                return callback(null, SetResponse.setSuccess("Sorry!! Your action can not be completed", {success:false,errMsg:err}));
              }

            });
      }else {
        domain.Advert.findOneAndUpdate({
                "fileInformation.entry_id": entry_id
            }, {
                $inc: {
                    number_of_likes: 1
                }
            }, {new: true},
            function (err, object) {
              // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
              if(!err){
                return callback(err, SetResponse.setSuccess("Liked", {
                    success:true,
                    number_of_likes: object.number_of_likes,
                    entry_id: object.fileInformation.entry_id,
                    likeFlag: true
                }));
              }else {
                return callback(null, SetResponse.setSuccess("Sorry!! Your action can not be completed", {success:false,errMsg:err}));
              }

            });
      }

  })
}

var dislikeTheAdvertisement = function(ad_id, user_id, entry_id, callback){
  domain.Like_History.update({
    ad_id:ad_id},
    {$pull:{like_by_users:user_id}},function(err,resObj){
      if(resObj.nModified==0){
        domain.Advert.findOne({
                "fileInformation.entry_id": entry_id
            },
            function (err, object) {
              // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
              if(!err){
                return callback(err, SetResponse.setSuccess("Already Unliked", {
                    success:true,
                    number_of_likes: object.number_of_likes,
                    entry_id: object.fileInformation.entry_id,
                    likeFlag: true
                }));
              }else {
                return callback(null, SetResponse.setSuccess("Sorry!! Your action can not be completed", {success:false,errMsg:err}));
              }

            });
      }else {
        domain.Advert.findOneAndUpdate({
                "fileInformation.entry_id": entry_id,
                number_of_likes:{$gte:1}
            }, {
                $inc: {
                    number_of_likes: -1
                }
            }, {
                new: true
            },
            function (err, object) {
              if(!err && object){
                // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
                callback(err, SetResponse.setSuccess("Unliked", {
                    success:true,
                    number_of_likes: object.number_of_likes,
                    entry_id: object.fileInformation.entry_id,
                    likeFlag: false
                }));
              }else {
                return callback(null, SetResponse.setSuccess("Sorry!! Your action can not be completed", {success:false,errMsg:err}));
              }

            });
      }
  })
}

var createNewBucketForLikes = function(ad_id, user_id, callback){
  var newLikeHistoryobject = new domain.Like_History({
      ad_id: ad_id,
      like_by_users: [user_id]
  });
  newLikeHistoryobject.save(function (err, saveObject) {
      domain.Advert.findOneAndUpdate({
          "_id": ad_id,
          deleted: false
      }, {
          $inc: {
              number_of_likes: 1,
          },
          current_like_bucket: saveObject._id
      }, {
          new: true
      }, function (err, object) {
        // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
        if(!err){
          return callback(err, SetResponse.setSuccess("Liked", {
              success:true,
              number_of_likes: object.number_of_likes,
              entry_id: object.fileInformation.entry_id,
              likeFlag: true
          }));
        }else {
          return callback(null, SetResponse.setSuccess("Sorry!! Your action can not be completed", {success:false,errMsg:err}));
        }
      });
  });
}

UserSessionService.prototype.uploadMedia = function(file, type, callback){
  var fs = require('fs');
  var AWS = require('aws-sdk');
    fs.readFile(file.path, function (err, data) {
        if (err) throw err; // Something went wrong!
        var s3bucket = new AWS.S3({params: {Bucket: 'weone-staging-data'}});
        s3bucket.createBucket(function () {
            var params = {
                Key: file.path, //file.name doesn't exist as a property
                Body: data
            };
            s3bucket.upload(params, function (err, data) {
                // Whether there is an error or not, delete the temp file
                fs.unlink(file.path, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });

                console.log("PRINT FILE:", file,data);
                if (err) {
                    console.log('ERROR MSG: ', err);
                    callback(err, SetResponse.setSuccess("Some error",err));
                } else {
                    console.log('Successfully uploaded data');
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, file));
                }
            });
        });
    });
  // var timeStamp = new Date().getTime() + Math.floor(Math.random() * 10000);
  // var nameSplitArray = file.name.split('.')
  // var extension = nameSplitArray[nameSplitArray.length - 1];
  // var fileName = timeStamp + '.' + extension;
  // var serverPath;
  // var responseFile;
  // if (type == 'image') { //code for chatimage upload
  //     uploadChatImage(file,serverPath,responseFile,fileName,timeStamp,callback);
  // } else if (type == 'video') {//code for chatVideo upload
  //     // Logger.info("code for chatvideo upload");
  //     uploadChatVideo(serverPath,file,fileName,timeStamp,responseFile,callback);
  // } else { //code for normal image upload
  //     // Logger.info("code for normal image upload");
  //     serverPath = '/opt/Weone/' + fileName;
  //     responseFile = configurationHolder.config.imageUrl + fileName;
  //     responseOfUpload(file.path, serverPath, responseFile, callback);
  // }
}

var responseOfUpload = function (filePath, serverPath, responseFile, callback) {


  // console.log("the params are",filePath);
  //   var params = {
  //     localFile: filePath,
  //
  //     s3Params: {
  //       Bucket: "weone-staging-data",
  //       Key: "weone-prod-images/aaa.jpg"
  //       // other options supported by putObject, except Body and ContentLength.
  //       // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  //     },
  //   };
  //   var uploader = client.uploadFile(params);
  //   uploader.on('error', function(err) {
  //     console.error("unable to upload:", err.stack);
  //   });
  //   uploader.on('progress', function() {
  //     console.log("progress", uploader.progressMd5Amount,
  //     uploader.progressAmount, uploader.progressTotal);
  //   });
  //   uploader.on('end', function() {
  //     console.log("done uploading");
  //   });
}

var uploadChatImage = function(file, serverPath, responseFile,fileName,timeStamp, callback){


      //  Logger.info('code for chatimage upload');
        // serverPath = configurationHolder.config.chatImagePath + '/' + fileName;
        // fs.rename(
        //     file.path, serverPath,
        //     function (err) {
        //         if (err) {
        //             callback(new Error("Something Went Wrong"))
        //         } else {
        //             // Logger.info('success');
        //             ffmpeg(serverPath).size('10%').save(configurationHolder.config.chatImagePath + '/' + timeStamp + '_thumbnail.png').on('end', function () {
        //                 // Logger.info('ddddd')
        //                 responseFile = {};
        //                 responseFile.type = 'image';
        //                 responseFile.imageUrl = configurationHolder.config.imageUrl + 'chatimage/' + fileName;
        //                 responseFile.thumbnailUrl = configurationHolder.config.imageUrl + 'chatimage/' + timeStamp + '_thumbnail.png';
        //                 callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, responseFile));
        //             });
        //         }
        //     }
        // );
}

var uploadChatVideo = function(serverPath,file,fileName,timeStamp,responseFile,callback){
   serverPath = configurationHolder.config.chatVideoPath + '/' + fileName;
        fs.rename(
            file.path, serverPath,
            function (err) {
                if (err) {
                    callback(new Error("Something Went Wrong"))
                } else {
                    // Logger.info("serverpath", serverPath);
                    ffmpeg(serverPath).screenshots({
                        count: 1,
                        folder: configurationHolder.config.chatVideoPath + "/",
                        filename: timeStamp + '_thumbnail.png',
                        size: '320x240'
                    }).on('end', function () {
                        // Logger.info("thumbnail generated successfully and save into the object");
                        responseFile = {};
                        responseFile.type = "video";
                        responseFile.thumbnailUrl = configurationHolder.config.imageUrl + 'chatvideo/' + timeStamp + '_thumbnail.png';
                        responseFile.videoUrl = configurationHolder.config.imageUrl + 'chatvideo/' + fileName;
                        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, responseFile));
                    }).on('error', function (error) {
                        // Logger.info("errror in ffmpeg");
                        // Logger.info(error);
                    });
                }
            }
        );

}



UserSessionService.prototype.isPhonenumberAvail = function(phonenumber, user, callback){
  domain.User.count({phonenumber:phonenumber},function(err,count){
    if(!err){
      if(count>0){
        callback(err, SetResponse.setSuccess("Sorry! "+phonenumber+" has already been registered.", {success:true,isNumberAvailable:false}));
      }else {
        domain.User.update({phonenumber:user.phonenumber},{$set:{newMobileNo:phonenumber}},function(err,res){
          console.log("the res is",user.phonenumber,err,res);
          if(!err){
            callback(err, SetResponse.setSuccess("This number is available",{success:true,isNumberAvailable:true}));
          }else {
            callback(err, SetResponse.setSuccess("Some error occured",{success:false,isNumberAvailable:false,errorMsg:err}));
          }
        })
      }
    }else {
      callback(err, SetResponse.setSuccess("Some error occured",{success:false,isNumberAvailable:false,errorMsg:err}));
    }

  })
}

UserSessionService.prototype.updatePhonenumber = function(userObj, phonenumber, callback){
  domain.User.count({phonenumber:phonenumber},function(err,count){
    if(!err){
      if(count>0){
        callback(err, SetResponse.setSuccess("Sorry! "+phonenumber+" has already been registered.", {success:true,isNumberAvailable:false}));
      }else {
        domain.User.update({phonenumber:userObj.phonenumber},{$set:{phonenumber:phonenumber,isPhonenumberVerified:false}},function(err,res){
          if(!err){
            callback(err, SetResponse.setSuccess("The phonenumber has been updated Successfully",{success:true}));
          }else {
            callback(err, SetResponse.setSuccess("Some error occured",{success:false,errorMsg:err}));
          }
        })
      }
    }else {
      callback(err, SetResponse.setSuccess("Some error occured",{success:false,isNumberAvailable:false,errorMsg:err}));
    }

  })
}

UserSessionService.prototype.setDeleteRequest = function(userObj, params, callback){
  if(userObj.userPin == params.pin){
    domain.DeleteRequests.findOne({user:userObj._id},function(err,delObj){
      if(delObj!=null){
        if(delObj.status == 'PENDING' && params.status == 'CANCELLED'){
          domain.DeleteRequests.update({user:userObj._id},{$set:{status:'CANCELLED'}},function(err,res){
            if(!err){
              return callback(null, SetResponse.setSuccess("Your Request for the Account Deletion has been Cancelled.",{success:true,isUserPinVerified:true,requestCurrentStatus:'CANCELLED'}));
            }else {
              return callback(null, SetResponse.setSuccess("Some Error Occured.",{success:false,requestCurrentStatus:'N/A',errorMsg:err}));
            }
          })
        }else if(delObj.status == 'PENDING' && params.status == 'PENDING'){
          return callback(null, SetResponse.setSuccess("Your Request for Account Deletion is under process",{success:true,isUserPinVerified:true,requestCurrentStatus:'PENDING'}));
        }else if(delObj.status == 'CANCELLED' && params.status == 'PENDING'){
          domain.DeleteRequests.update({user:userObj._id},{$set:{'status':'PENDING'}},function(err,res){
            if(!err){
              return callback(null, SetResponse.setSuccess("Your Request for the Account Deletion is sent to the Admin for the approval.",{success:true,isUserPinVerified:true,requestCurrentStatus:'PENDING'}));
            }else {
              return callback(null, SetResponse.setSuccess("Some Error Occured.",{success:false,isUserPinVerified:true,requestCurrentStatus:'N/A',errorMsg:err}));
            }
          })
        }else if(delObj.status == 'CANCELLED' && params.status == 'CANCELLED'){
          return callback(null, SetResponse.setSuccess("Your Request is already Cancelled",{success:true,isUserPinVerified:true,requestCurrentStatus:'CANCELLED'}));
        }else {
          return callback(null, SetResponse.setSuccess("Invalid Request",{success:false,isUserPinVerified:true,requestCurrentStatus:'N/A'}));
        }
      }else {
        var del_data = {};
        del_data.user = userObj._id;
        del_data.status = 'PENDING';
        var del_otp = new domain.DeleteRequests(del_data);
        del_otp.save(function(err,otp_save){
          if(!err){
            return callback(null, SetResponse.setSuccess("Your Request for the Account Deletion is sent to the Admin for the approval.",{success:true,isUserPinVerified:true,requestCurrentStatus:'PENDING'}));
          }else {
            return callback(null, SetResponse.setSuccess("Some Error Occured.",{success:false,isUserPinVerified:true,requestCurrentStatus:'N/A',errorMsg:err}));
          }
        })
      }
    })
  }else {
    return callback(null, SetResponse.setSuccess("Sorry!! Pin can't be matched",{success:true,isUserPinVerified:false,requestCurrentStatus:'N/A'}));
  }
}

UserSessionService.prototype.deleteById = function(params, callback){
  domain.User.remove({_id:params.id},function(err,res){
    if(!err){
      return callback(null, SetResponse.setSuccess("Deleted Successfully"));
    }else {
      return callback(null, SetResponse.setSuccess("Some error occured",{errorMsg:err}));
    }
  })
}

UserSessionService.prototype.getAuthByPhonenumber = function(params, callback){
  domain.User.findOne({phonenumber:params.phonenumber},function(err,res){
    if(!err && res){
      domain.Authentication_Token.findOne({user:res._id},function(err,authObj){
        if(!err){
          return callback(null, SetResponse.setSuccess("The Auth Obj is",authObj));
        }else {
          return callback(null, SetResponse.setSuccess("Some error occured",{errorMsg:err}));
        }
      })
    }else {
      return callback(null, SetResponse.setSuccess("Some error occured",{errorMsg:err}));
    }
  })
}

UserSessionService.prototype.getUserByPhonenumber = function(params, callback){
  domain.User.find({phonenumber:params.phonenumber},function(err,res){
    if(!err){
      return callback(null, SetResponse.setSuccess("The User Obj is",res));
    }else {
      return callback(null, SetResponse.setSuccess("Some error occured",{errorMsg:err}));
    }
  })
}

UserSessionService.prototype.getUserExistence = function(params, callback){
  var phonenumber = params.phonenumber;
  domain.User.findOneAndUpdate({phonenumber:phonenumber},{isPhonenumberVerified:false},{new:true},function(err,userObj){
    if(!err){
      if(userObj!=null && userObj.role=='ROLE_USER'){
        domain.Authentication_Token.findOneAndUpdate(
          {user:userObj._id},
          {authToken:uuid.v1()},
          {new:true},
          function(err,result){
            if(!err && result){
              callback(err, SetResponse.setSuccess("This is an Existing User", {success:true,isExistingUser:true,authToken:result.authToken,userObj:userObj}));
            }else {
              var authenticationObj = new domain.Authentication_Token({
                  email: userObj.email,
                  user: userObj._id,
                  authToken: uuid.v1()
              })
              authenticationObj.save(function (err, result){
                callback(err, SetResponse.setSuccess("This is an Existing User", {success:true,isExistingUser:true,authToken:result.authToken,userObj:userObj}));
              })
            }
          })
      }else {
        if(userObj){
          callback(err, SetResponse.setSuccess("This is the New User",{success:true,isExistingUser:false}));
        }else {

          var userObj = new domain.User({
              phonenumber: parseInt(phonenumber)
          });
          userObj.save(function (err, res) {
            if(!err){
              callback(err, SetResponse.setSuccess("This is the New User",{success:true,isExistingUser:false}));
            }else {
              callback(err, SetResponse.setSuccess("Some error occured",{success:false,isExistingUser:false,errorMsg:err}));
            }
          });
        }
      }
    }else {
      callback(err, SetResponse.setSuccess("Some error occured",{success:false,isExistingUser:false,errorMsg:err}));
    }

  })
}

UserSessionService.prototype.isVersionUpdated = function(userObj, params,callback){
  var resObj = {};
  resObj.recommendUpdate = false;
  resObj.forceUpdate = false;
  resObj.success = false;
  resObj.latest_version = params.current_version;
  resObj.message = 'null';
  if(userObj.app_platform == 'android' || userObj.app_platform == 'ios'){
    domain.App_Version_Details.findOne({deleted:false,platform:userObj.app_platform},function(err,res){
      if(!err && res){
        resObj.success = true;
        resObj.latest_version = res.current_version;
        resObj.message = res.message;
        resObj.platform = res.platform;
        callback(null, SetResponse.setSuccess("These are the Version Details",resObj));
      }else {
        callback(null, SetResponse.setSuccess("Some Error Occured",{success:false,errorMsg:err}));
      }
    })
  }else {
    callback(null, SetResponse.setSuccess("Version Details can't be fetched as the user's device platform is missing.",{success:false,errorMsg:err}));
  }


}

UserSessionService.prototype.updateVersion = function(params,callback){
  var saveObj = {};
  saveObj.current_version = params.current_version;
  var platform = params.platform;
  if(platform == 'android' || platform == 'ios'){
    saveObj.platform = platform;
    domain.App_Version_Details.findOneAndUpdate({deleted:false,platform:platform},saveObj,{new:true},function(err,appVersionObj){
      if(appVersionObj!=null){
        callback(err, SetResponse.setSuccess("The APP Version is Updated", {success:true,versionObj:appVersionObj}));
      }else {
        var appVersion = new domain.App_Version_Details(saveObj);
        appVersion.save(function (err, result){
          callback(err, SetResponse.setSuccess("The APP Version is Saved", {success:true,versionObj:result}));
        })

      }
    })
  }else {
    callback(err, SetResponse.setSuccess("Invalid platform"));
  }
}

UserSessionService.prototype.smsCountryRes = function(params,callback){
  // console.log("the res is",params);
  if(params){
    var param =" mobile number "+ params.mobilenumber +" ,message : "+ params.message +" ,receivedon: "+params.receivedon+ "";
    SendMailService.prototype.sendMailToCheckSmsCountryResponse(param,"ajit.jati@oodlestechnologies.com");
  }
  var phonenumber = params.mobilenumber;
  if(params.mobilenumber){

    domain.User.count({phonenumber:phonenumber},function(err,count){
      if(count>0){
        domain.User.update({phonenumber:phonenumber},{$set:{isPhonenumberVerified:true}},function(err,res){
          if(!err){
            callback(null, SetResponse.setSuccess("The phonenumber has been verified Successfully",{success:true}));
          }else {
            callback(null, SetResponse.setSuccess("The phonenumber can't be verified due to some error",{success:false,errorMsg:err}));
          }
        })
      }else {
        // console.log("Updating for Mobile Change");
        domain.User.update({newMobileNo:parseInt(phonenumber)},{$set:{isPhonenumberVerified:true}},{multi:true},function(err,res){
          // console.log("the update res is",err,res);
          if(!err){
            callback(null, SetResponse.setSuccess("The phonenumber has been verified Successfully",{success:true}));
          }else {
            callback(null, SetResponse.setSuccess("The phonenumber can't be verified due to some error",{success:false,errorMsg:err}));
          }
        })
      }
    })


  }else {
    callback(null, SetResponse.setSuccess("Can't find phonenumber in the parameters",{success:false}));
  }

}

UserSessionService.prototype.isPhonenumberVerified = function(params,callback){
  var phonenumber = params.phonenumber;
  domain.User.findOne({phonenumber:phonenumber},function(err,res){
    if(!err){
      if(res){
        if(res.isPhonenumberVerified){
          callback(null, SetResponse.setSuccess("The phonenumber has been verified.",{success:true,isPhonenumberVerified:true}));
        }else {
          callback(null, SetResponse.setSuccess("The phonenumber has not been verified yet",{success:true,isPhonenumberVerified:false}));
        }
      }else {
        callback(null, SetResponse.setSuccess("The phonenumber can't be found ",{success:true,isPhonenumberVerified:false}));
      }
    }else {
      callback(null, SetResponse.setSuccess("Some error has occured",{success:false,isPhonenumberVerified:false,errorMsg:err}));
    }
  })
}

UserSessionService.prototype.isNewPhonenumberVerified = function(params, user, callback){
  var phonenumber = params.phonenumber;
  // console.log("the phonenumber is",user);
  domain.User.findOne({phonenumber:user.phonenumber,role:'ROLE_USER'},function(err,res){
    if(!err){
      if(res){
        if(res.isPhonenumberVerified){
          callback(null, SetResponse.setSuccess("The phonenumber has been verified.",{success:true,isPhonenumberVerified:true}));
        }else {
          callback(null, SetResponse.setSuccess("The phonenumber has not been verified yet",{success:true,isPhonenumberVerified:false}));
        }
      }else {
        callback(null, SetResponse.setSuccess("The phonenumber can't be found ",{success:true,isPhonenumberVerified:false}));
      }
    }else {
      callback(null, SetResponse.setSuccess("Some error has occured",{success:false,isPhonenumberVerified:false,errorMsg:err}));
    }
  })
}

module.exports = function (app) {
    return new UserSessionService(app);
};
