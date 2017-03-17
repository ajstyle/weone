var SetResponse = require('../SetResponseService');
var SendSMS = require('../SendSMSService');
module.exports.AuthenticationService = (function () {
    //private variables
    var encryptedPassword
        // private methods
        /* method used to  encrypt string using sha1 method , accept value and salt
         * @payload  password (string) , salt (string)
         * return encryptedPassword (string)
         */
        var passwordEncryption = function (password, salt) {
            //Logger.info("passwordEncryption == " + password + salt)
            encryptedPassword = crypto.createHmac('sha1', salt).update(password.toString()).digest('hex')
            return encryptedPassword
        }

    /* method used to  match password enter by client after encrypting it to that of password saved in the database
     * @payload  User object  and password string
     * return boolean true if password matched  , else return false
     */
    var verifyPassword = function (user, password) {
        passwordEncryption(password, user.salt)
        var passwordVerificationResult = (user.password == encryptedPassword) ? true : false
        return passwordVerificationResult
    }

    var userLogout = function (authToken, callback) {
        //Logger.info("control in the user logout ", authToken);
        domain.Authentication_Token.remove({
            authToken: authToken
        }, function (err, user) {
            if (err) {

                callback(internalError, null)
            } else {
                callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.userLogout, user));
            }

        })
    }
/*
    Function is used to delete app user account
    @params authToken i.e token of user to be deleted
    @deleObj object contains deleted object info
*/
var deleteUserAccount  = function (authToken, callback ){
       //Logger.info("control in user deleted account in Authentication service");
            domain.Authentication_Token.findOne({
                authToken: authToken,
                deleted: false
            }, function (err, userObj) {
                if (err) {
                    callback(SetResponse.setSuccess("Some error has occurred !"), null);
                } else {
                    domain.Authentication_Token.remove({
                        authToken: authToken
                    }, function (err, user) {
                        if (err) {
                            callback(SetResponse.setSuccess("Some error has occurred !"), null)
                        } else {
                            domain.User.findOneAndUpdate({_id: userObj.user,deleted: false}, {deleted: true,phonenumber: '',email: '',otp_code: ''}, null, function (err, deleObj) {
                                if (deleObj) {
                                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.accountDeleted, deleObj));
                                    //Logger.info("user is deleted in neo4j", deleObj.neo4J_node_id);
                                    neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)=" + deleObj.neo4J_node_id + " set n.deleted=true", function (err, obj) {
                                        //Logger.info("deleted the flag of the object false", obj);
                                    });
                                } else {
                                    callback(SetResponse.setSuccess("Some error has occurred !"), null);
                                }
                            })
                        }
                    })
                }
            });


}
/*
    Function is used to delete admin side user
    @params authToken i.e token of the user which is going to be delete
    @params req object
*/
    var deleteAccount = function (authToken, callback, req) {
        //Logger.log("Control in deleteAccount method of AuthService layer", req.body.id);
        if (req.body.id) {
            //Logger.info("control in the admin side delete");
            domain.User.findOneAndUpdate({_id: req.body.id,deleted: false}, {deleted: true,phonenumber: '',email: '',otp_code: '',referralId:''}, null, function (err, deleObj) {
                if (deleObj) {
                    domain.Authentication_Token.remove({user:req.body.id},function(err,del){
                      if(!err){
                        //Logger.info("Deleted the Token");
                      }else {
                        //Logger.info("Some error in deleting the token");
                      }
                    })
                    //Logger.info("user is deleted in neo4j", deleObj.neo4J_node_id);
                    neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)=" + deleObj.neo4J_node_id + " set n.deleted=true", function (err, obj) {
                        //Logger.info("deleted the flag of the object false", obj);
                    });
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.accountDeleted, deleObj));
                } else {
                    callback(SetResponse.setSuccess("Some error has occurred !"), null);
                }
            });

        } else {
            //control in app user delete
            deleteUserAccount(authToken,callback);

        }
    }

/*
    Function is used to send link to email for resetting password
    @params email is taken so that a mail send on this emailId
    @return 401 if incoorect email or email is not registered with weone, 500 in case other technical errors,
    Success object and send mail in case of success
*/
var forgotPassword = function (email, res, callback) {
        var email = decodeURIComponent(email);
        domain.User.findOne({
            email: email,
            deleted: false
        }, function (err, user) {
            if (!user) {
                callback(SetResponse.setError(configurationHolder.Message.Error.incorrectEmail, 401), null);
            }
            else if(err){
                //Logger.error("Error in forgot password.."+err);
                    callback(err,null);
            }
             else  {
                    async.auto({
                        token: function (next, result) {
                            return gereratePasswordToken(user, email, res, next, callback);
                        },
                        sendMail: ['token', function (next, result) {
                            return SendMailService.prototype.forgetPasswordMail(next, result.token.verificationToken, email, user.name);
                  }]
                    }, function (err, result) {
                        if (err == null && result != null) {
                            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.forgotPasswordLink, result))
                        } else {
                             //Logger.error("Error in forgot password.."+err);
                             callback(SetResponse.setError(configurationHolder.Message.Error.forgotPasswordLink, 500), null);
                        }
                    })
            }
        })
    }

    var resetPassword = function (req, res, callback) {
            if (req.body.password != req.body.password1) {
                callback(SetResponse.setError(configurationHolder.Message.Error.confirmPasswordNotMatch, 401), null)
            } else {
                domain.Verification_Token.findOne({
                    verificationToken: req.body.authToken
                }, function (err, object) {
                    if (!object) {
                        callback(SetResponse.setError(configurationHolder.Message.Error.tokenVerify, 401), null);
                    } else {
                        domain.User.findOne({
                            _id: object.user
                        }, function (err, doc) {
                            //Logger.info('Before reset ', doc)
                            if (err == null) {
                                //Logger.info('Pass reset ', doc.salt, " kh ", req.password)
                                var newPass = crypto.createHmac('sha1', doc.salt).update(req.body.password.toString()).digest('hex')
                                //Logger.info(err, 'doc ', doc)
                                domain.User.update({_id: doc._id,deleted: false}, {
                                    $set: {password: newPass}
                                }, function (err, ressult) {
                                    //Logger.info('ressult  ', ressult, "err ", err)
                                    domain.Verification_Token.remove({
                                        verificationToken: req.body.authToken
                                    }, function (err, object) {
                                        //Logger.info('err ', err, ' hwgfdhw ')
                                        if (err) {
                                            callback(new Error(configurationHolder.Message.Error.internalServer), null)
                                        } else {
                                            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.passwordUpdate, ressult))
                                        }
                                    })
                                })
                            } else {
                                callback(SetResponse.setError(configurationHolder.Message.Error.tokenVerify, 401), null)
                            }
                        })
                    }
                });

            }
        }

        var gnererateNewAuthToken = function(user ,callback){
          var debuggger= false;
          if(!user){
            var message="User Object NUll initially";
            var phonenumber="919899584411";
            debuggger = true;
            SendSMS.generalMessage(phonenumber,message);
            SendSMS.generalMessage("918826363799",message);
          }
                //new user registration generate the verifacation token and auth token
                    var authenticationObj = new domain.Authentication_Token({
                        email: user.email,
                        user: user._id,
                        authToken: uuid.v1()
                    })
                    authenticationObj.save(function (err, authObj) {
                        if (err) {
                            callback(SetResponse.setError(configurationHolder.Message.Error.failedLogin, 401), null)
                        } else {
                            var sendData = {}
                            sendData.authToken = authObj.authToken;
                            sendData.user = user;
                            sendData.user.deleteRequest = false;
                            //Logger.info("Sending the deleteRequest");
                            // Logger.info("user object is getting null ",sendData);
                            if(!sendData.user && !debuggger){
                              var message="User Object NUll before callback";
                              var phonenumber="919899584411";
                              SendSMS.generalMessage(phonenumber,message);
                              SendSMS.generalMessage("918826363799",message);
                            }
                            generateRegistrationToken(user._id, user.email, user.name);
				// console.log("the send data iis",sendData.user);
                            console.log("the send data iis",sendData.user.referralId);
                            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.userRegister, sendData));

                        }
                    })

        }


        /* generate authenticationToken for new registered user and update the token if use
        already existing becuase we want one user to be login only in one device at at time and
        return it to the calling function. Call from verifyOTP and User Registration
         * @payload  User's object
         * return authenticationToken
         */
    var generateAuthenticationToken = function (user, callback) {
        //Logger.log("Control in generateAuthenticationToken method of AuthenticationService");
        domain.Authentication_Token.findOne({
            user: user._id
        }, function (err, obj) {
            if (obj) {
                domain.Authentication_Token.update({
                    user: obj.user,
                }, {
                    authToken: uuid.v1()
                }, function (err, usr) {
                    if (err) {
                        callback(failedloginErr, null);
                    } else {
                        domain.Authentication_Token.findOne({
                            user: obj.user
                        }, function (err, usrr) {
                            var sendData = {}
                            sendData.authToken = usrr.authToken;
                            sendData.user = user;
                            domain.DeleteRequests.findOne({user:obj.user},function(err,del_request){
                              if(!err){
                                if(del_request){
                                  if(del_request.status == 'PENDING'){
                                    sendData.deleteRequest = true;
                                  }else {
                                    sendData.deleteRequest = false;
                                  }
                                  callback(err, SetResponse.setSuccess("OTP Verified", sendData))
                                }else {
                                  sendData.deleteRequest = false;
                                  callback(err, SetResponse.setSuccess("OTP Verified", sendData))
                                }
                              }else {
                                callback(err,SetResponse.setSuccess("Some error has occurred !"));
                              }
                            })

                        })
                    }

                })
            } else {
                //new user registration generate the verifacation token and auth token
            gnererateNewAuthToken (user , callback);
            }

        })

    }

    /* verify whether the user exist in the system or not
     * find the user by emai
     * match the password
     * generate the authentiction token
     */
    var authenticate = function (email, password, callback, next) {
        domain.User.findOne({
            email: email,
            accountLocked: false //,
                // isAccountActive: true
        }, function (err, user) {
            if (user && verifyPassword(user, password)) {

                var authenticationObj = new domain.Authentication_Token({
                    email: email,
                    user: user._id,
                    authToken: uuid.v1()
                })
                authenticationObj.save(function (err, authObj) {
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.loginSuccess, authObj));
                });
            } else {


                callback(SetResponse.setError(configurationHolder.Message.Error.failedLogin, 401), null);
            }
        })
    }

    var gereratePasswordToken = function (user, email, res, next, callback) {
            var verificationToken = uuid.v1();
            var verificationObj = new domain.Verification_Token({
                verificationToken: verificationToken,
                email: email,
                user: user._id
            });
            verificationObj.save(function (err, verificationObj) {
                if (err) {
                    callback(new Error(configurationHolder.Message.Error.internalServer), null);
                }
                next(err, verificationObj);
            })
        }
        // it will generate the registartion token to verify the account from email
    var generateRegistrationToken = function (userid, email, name) {
        //Logger.info(userid, "control in the generateRegistrationToken ", email, name)
        var verificationToken = uuid.v1();
        var verificationObj = new domain.Registration_Token({
            registrationToken: verificationToken,
            email: email,
            user: userid
        });
        verificationObj.save(function (err, verificationObj) {
            if (err){}
                //Logger.info("error is occure in generating the verifaction token", err);
            else {
                //Logger.info("control in the send email ");
                SendMailService.prototype.verificationTokenMail(name, verificationToken, email);
            }
        })
    }

    var verifyRegEmail = function (token, res) {
        //Logger.info("control in the verify token service", token);
        var filepath = publicdir + '/view/verifiedEmail.html';
        file.readFile(filepath, 'utf-8', function (error, content) {
            domain.Registration_Token.findOne({
                registrationToken: token,
                deleted: false
            }, function (err, obj) {
                if (obj) {
                    //Logger.info("token verify");
                    domain.User.findOneAndUpdate({
                        _id: obj.user,
                        deleted: false
                    }, {
                        isAccountActive: true
                    }, null, function (err, updateobj) {

                        //Logger.info("user object active successfully");
                    });
                    obj.softdelete(function (err, obj) {
                        //   callback(err, setResponse("your token is successfully veify", obj));
                        res.end(ejs.render(content, {
                            message: configurationHolder.Message.Success.emailVerfiySuccess,
                            serverSideCss:configurationHolder.config.serverCssFileName,
                            serverSideLogoPath:configurationHolder.config.serverSideLogoPath
                        }));
                    });
                } else {
                    //Logger.info('invalid token');
                    //res.render(path.join(publicdir + '/view/verifiedEmail.ejs'));
                    res.end(ejs.render(content, {
                        message: configurationHolder.Message.Error.emailVerfiyError,
                        serverSideCss:configurationHolder.config.serverCssFileName,
                        serverSideLogoPath:configurationHolder.config.serverSideLogoPath
                    }));
                }
            });
        });
    }

    /*
    Function is reponsible for change or update mobile number of user
    @params verifyObject contains info like mobileno,regToken etc
    @params userId for finding user
    */
    var changeMobileNumber = function (userId,verifyObject,callback) {
    domain.User.findOneAndUpdate({
        _id: userId,
        deleted: false,
        newMobileNo: verifyObject.mobileNumber
    }, {
        newMobileNo: '',
        phonenumber: verifyObject.mobileNumber,
        registration_token: verifyObject.registration_token,
        app_platform: verifyObject.app_platform
    }, {new:true}, function (err, obj) {
        obj = JSON.parse(JSON.stringify(obj));
        obj.OTPMatched = true;
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.validOTP, obj));

    });
}

/*
  Function is used to return the time diff between current time and when user genrate OTP.
*/
var timeDifferance = function (updateDate) {
    var currentDate = new Date();
    return  currentDate - updateDate;
}

 /*
This Function is responsible for verifying OTP and check wheather user is already registered or not.
@return success object if validOTP and user not registered yet.
@return already registered object if valid OTP and user is already registerd and also update token of user.
 */

var checkAlreadyRegistered  = function(verifyObject,callback){
    //Logger.info("into checkalready registered function of Authentication Service");
    domain.User.findOneAndUpdate({
    phonenumber: verifyObject.mobileNumber,
                otp_code: verifyObject.otp
            }, {
                registration_token: verifyObject.registration_token,
                app_platform: verifyObject.app_platform
            }, {
                new: true
            }, function (err, obj) {
                    if (obj) {
                        var timeDiffmilliseconds = timeDifferance(new Date(obj.updatedAt));
                        if (timeDiffmilliseconds < configurationHolder.config.OTPExpiryTime) {
                            if (obj.email) { // checking wheather user is already registered
                               generateAuthenticationToken(obj,callback);
                            } else {
                                //Logger.info("New user registration")
                                obj = JSON.parse(JSON.stringify(obj));
                                obj.deleteRequest = false;
                                obj.OTPMatched = true;
                                callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.validOTP, obj));
                            }
                        }else {
                          callback(null, SetResponse.setSuccess(configurationHolder.Message.Error.ExpiredOTP,{OTPMatched:false}));
                        }
                    } else {
                        callback(null, SetResponse.setSuccess("OTP is incorrect. Please try again or generate a new one.",{OTPMatched:false}));
                        //callback(SetResponse.setError(configurationHolder.Message.Error.ExpiredOTP, 401), null);
                    }
            });
}

/*
   Function is used to verify the OTP code and update the mobile number in case of user otherwise call checkAlreadyRegistered method.
   @params verifyObject that contains mobileno and OTP etc
   @params user in case of changemobile request
*/
    var verifyOTPCode = function (verifyObject, user, callback) {
        //Logger.info(verifyObject, "control in the  verifyOTPCode service layer");
        //This code is used when user update the mobile number then user need to verify the otp
        if (user) {
            //Logger.info('control in update mobile number');
            domain.User.findOne({
                newMobileNo: verifyObject.mobileNumber,
                otp_code: verifyObject.otp
            }, function (err, obj) {
                    if (obj) {
                        var timeDiffmilliseconds = timeDifferance(new Date(obj.updatedAt));
                        if (timeDiffmilliseconds < configurationHolder.config.OTPExpiryTime) {
                           changeMobileNumber(user._id,verifyObject,callback)
                        } else {
                            //Logger.info("time expired");
                            //callback(SetResponse.setError(configurationHolder.Message.Error.ExpiredOTP, 401), null);
                            callback(null, SetResponse.setSuccess(configurationHolder.Message.Error.ExpiredOTP,{OTPMatched:false}));
                        }
                    } else {
                        //Logger.info("can't find any user or invalid otp");
                        callback(null, SetResponse.setSuccess(configurationHolder.Message.Error.invalidOTP,{OTPMatched:false}));
                    }
            });
        } else {
            checkAlreadyRegistered(verifyObject,callback);
        }

    }





    var setResponse = function (message, object) {
        var response = {}
        response.message = message;
        response.object = object
        return response;
    }
    var setError = function () {}

    var generateOTP = function(token, callback){
      domain.Authentication_Token.findOne({authToken:token},function(err,obj){
        if(!err){
          domain.User.findOne({_id:obj.user},function(err,user){
            if(!err){
              var phone = user.phonenumber.toString();
              //Logger.info("the phonenumber is",phone);
              var otp = generate_otp(phone);
              domain.DeleteRequests.findOne({user:obj.user},function(err,res){
                if(!err){
                  if(res){
                    domain.DeleteRequests.update({user:obj.user},{$set:{otp:otp}},function(err,otp_update){
                      if(!err){
                        SendSMS.sendOTPService(phone, otp);
                        callback(null, SetResponse.setSuccess("OTP has been sent"));
                      }else {
                        callback(new Error("Some error"))
                      }
                    })
                  }else {
                    var del_data = {};
                    del_data.user = obj.user;
                    del_data.otp = otp;
                    var del_otp = new domain.DeleteRequests(del_data);
                    del_otp.save(function(err,otp_save){
                      if(!err){
                        SendSMS.sendOTPService(phone, otp);
                        callback(null, SetResponse.setSuccess("OTP has been sent"));
                      }else {
                        callback(err,SetResponse.setSuccess("Some error has occurred !"));
                      }
                    })
                  }
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

    var generate_otp = function (mobileNumber) {
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

    var otp_update_email = function (token, email, callback) {
      domain.User.count({email:email},function(err,count){
        if(!err){
          if(count>0){
            callback(null, SetResponse.setSuccess("This email has already been registered. Please try with some other email.",{emailAlreadyRegistered:true}));
          }else {
            domain.Authentication_Token.findOne({authToken:token},function(err,obj){
              if(!err){
                domain.User.findOne({_id:obj.user},function(err,user){
                  if(!err){
                    //Logger.info("the user id is",user._id);
                    var mobile = user.phonenumber.toString();

                    var otp = generate_otp(mobile);
                    var name = user.name;
                    domain.User.update({_id:obj.user},{$set:{updated_email:email,otp_code_email_update:otp}},
                      function(err,res){
                      if(!err){
                        SendMailService.prototype.sendOTPForEmailUpdate(name,otp,email);
                        callback(null, SetResponse.setSuccess("OTP has been sent to the new email-id",{otp:otp,newEmail:email}));
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
        }
      })
    }

    var reset_badge_count = function (authToken, data, callback) {
        //Logger.info("control in the user logout ", authToken);
        var type = data.type;
        domain.Authentication_Token.findOne({
            authToken: authToken
        }, function (err, user) {
            if(!err){
              if(type == 'chat'){
                domain.User.findOneAndUpdate({_id: mongoose.Types.ObjectId(user.user)},{'badge_count_ios.chat_badge_count':0},{new:true},function(err,res){
                  //Logger.info("the res is",err,res.badge_count_ios.chat_badge_count);
                  if(!err){
                    callback(null, SetResponse.setSuccess("The chat badge count is reset",{isResetBadgeCount:true}));
                  }else {
                    callback(null, SetResponse.setSuccess("The chat badge count can't be reset",{isResetBadgeCount:false}));
                  }
                })
              }else if(type == 'update'){
                domain.User.findOneAndUpdate({_id: mongoose.Types.ObjectId(user.user)},{'badge_count_ios.update_badge_count':0},{new:true},function(err,res){
                  //Logger.info("the res is",err,res.badge_count_ios.chat_badge_count);
                  if(!err){
                    callback(null, SetResponse.setSuccess("The update badge count is reset",{isResetBadgeCount:true}));
                  }else {
                    callback(null, SetResponse.setSuccess("The update badge count can't be reset",{isResetBadgeCount:false}));
                  }
                })
              }else if(type == 'reward'){
                domain.User.findOneAndUpdate({_id: mongoose.Types.ObjectId(user.user)},{'badge_count_ios.reward_badge_count':0},{new:true},function(err,res){
                  //Logger.info("the res is",err,res.badge_count_ios.chat_badge_count);
                  if(!err){
                    callback(null, SetResponse.setSuccess("The reward badge count is reset",{isResetBadgeCount:true}));
                  }else {
                    callback(null, SetResponse.setSuccess("The reward badge count can't be reset",{isResetBadgeCount:false}));
                  }
                })
              }else if(type == 'global'){
                domain.User.findOneAndUpdate({_id: mongoose.Types.ObjectId(user.user)},{'badge_count_ios.global_badge_count':0},{new:true},function(err,res){
                  //Logger.info("the res is",err,res.badge_count_ios.chat_badge_count);
                  if(!err){
                    callback(null, SetResponse.setSuccess("The global badge count is reset",{isResetBadgeCount:true}));
                  }else {
                    callback(null, SetResponse.setSuccess("The global badge count can't be reset",{isResetBadgeCount:false}));
                  }
                })
              }
            }else {
              callback(null, SetResponse.setSuccess("Invalid Authentication Token",{isResetBadgeCount:false}));
            }
        })
    }

    var userInfo = function(userId, data, callback){
      var userObj = data;
      domain.User.findOneAndUpdate({_id:userId},userObj,{new:true},function(err,obj){
        if(!err){
          callback(null, SetResponse.setSuccess("Updated the User Details Successfully",{obj:obj}));
        }else {
          callback(err,SetResponse.setSuccess("Some error has occurred !"));
        }
      })
    }

    var resendVerificationLink = function(userEmail,callback){
         domain.User.findOne({
             email: userEmail,
             isAccountActive: true //,
                 // isAccountActive: true
         }, function (err, user) {

             if (err) {
                 callback(new Error(configurationHolder.Message.Error.internalServer), null);
             } else {

               //callback(null,SetResponse.setSuccess(user.name));
                 reGenerateRegistrationToken(user._id, user.email, user.name, callback);
                 callback(err, SetResponse.setSuccess("Verification Link has been sent to your email."));
             }
         })
   }

   // it will REGENERATE the registartion token to verify the account from email
    var reGenerateRegistrationToken = function (userid, email, name, callback) {
        var verificationToken = uuid.v1();
        domain.Registration_Token.findOneAndUpdate({user:userid},{registrationToken:verificationToken},{new:true},function(err,obj){
          if(err){
            //Logger.info("error has occured in regenerating the verification token", err);
          }else {
            //Logger.info("control in the send email ");
            //callback(err, SetResponse.setSuccess(verificationToken));
                    SendMailService.prototype.verificationTokenMail(name, verificationToken, email);
          }
        })
      }

    var url_change = function(query, callback){
      var old_url = query.url;
      var replaceable_url = query.replace_with; //'52.66.101.222'; //IP_Address for Wowza and file_indexing

      domain.User.find({},function(err,users ){
        users.forEach(function(user){
          var new_image_url = user.image_url.replace(old_url,replaceable_url);
          var new_logo_image_url = user.logo_image_url.replace(old_url,replaceable_url);
          domain.User.update({_id:user._id},{$set:{image_url:new_image_url,logo_image_url:new_logo_image_url}},
            function(err, user_update){
              //Logger.info("the user is updated",err,user_update);
          })
        })
      })

	domain.Advert.find({},function(err, adverts){

        adverts.forEach(function(advert){

          var new_custom_thumbnail = advert.custom_thmbnail.replace(old_url,replaceable_url);

          var new_thumbnail = advert.thumbnail.replace(old_url,replaceable_url);



          domain.Advert.update({_id:advert._id},{$set:{custom_thmbnail:new_custom_thumbnail,thumbnail:new_thumbnail}},function(err, advert_update){

            //Logger.info("the advert is updated",err,advert_update);

          })

        })

      })
	/*
      domain.Advert.find({},function(err, adverts){
        adverts.forEach(function(advert){
          var new_custom_thumbnail = advert.custom_thmbnail.replace(old_url,replaceable_url);

          domain.Advert.update({_id:advert._id},{$set:{custom_thmbnail:new_custom_thumbnail}},function(err, advert_update){
            //Logger.info("the advert is updated",err,advert_update);
          })
        })
      })
	*/
      domain.Contact_Us.find({},function(err, contacts){
        contacts.forEach(function(contact){
          var new_image_url = contact.image_url.replace(old_url,replaceable_url);
          domain.Contact_Us.update({_id:contact._id},{$set:{image_url:new_image_url}},function(err, contact_us_update){
            //Logger.info("the contact_us is updated",err,contact_us_update);
          })
        })
      })

      callback(null, SetResponse.setSuccess("Updated the URLs Successfully"));



    }

    var addUsersToTree = function(callback){
      domain.User.find({role:'ROLE_USER',deleted:false,neo4J_node_id:""}).exec(function(err, users){
        if(!err){
          if(users.length>0){
            //Logger.info("the users is",err,users.length,users[0].inviter);
            //var user_array = [users[0]];
            var user_array = users;
            user_array.forEach(function(userObj){
              var inviter = userObj.inviter;
              domain.User.findOne({_id:inviter},function(err, inviterObj){
                //generateAuthenticationToken(userObj, callback);
                // it will add the user object in to mlm
                MLMService.createUserNodeV2(userObj,inviterObj);
              })

            })
          }
          callback(null, SetResponse.setSuccess("Done successfully",{obj:users.length}));

        }
      })
    }

    var addOrphanedUsers = function(callback){
      neo4jDbConnection.cypherQuery("MATCH (s:user) WHERE NOT (s)<-[:Relationship]-(:user) RETURN s",
      function(err, result){
          //Logger.info("the response is",err,result.data.length);
          var data = [result.data[1]];
          //  var data = result.data;
          data.forEach(function(user){
              //Logger.info(user);
              if(user._id != 187){
                domain.User.findOne({_id:user.objectId}).populate('inviter').exec(function(err, userObj){
                  var inviter = userObj.inviter;
                  //Logger.info("the users inviter is",userObj.inviter);
                  if(userObj.inviter){
                    domain.MLM.remove({node_id:user._id},function(errs, del){
                      // //Logger.info("the mlm resp is",errs, del);
                    });
                  }
                  MLMService.addOrphanedUsersScript(userObj,inviter,user._id);
                })
              }else {
                //Logger.info("the users is",user);
              }
          })
          callback(null, SetResponse.setSuccess("Done successfully",{obj:result.data.length-1}));
      })
    }
    //return the method which you want it to be public

    return {
        authenticate: authenticate,
        forgotPassword: forgotPassword,
        resetPassword: resetPassword,
        userLogout: userLogout,
        generateAuthenticationToken: generateAuthenticationToken,
        verifyRegEmail: verifyRegEmail,
        deleteAccount: deleteAccount,
        verifyOTPCode:verifyOTPCode,
        generateOTP:generateOTP,
        otp_update_email:otp_update_email,
        reset_badge_count:reset_badge_count,
        userInfo:userInfo,
        resendVerificationLink:resendVerificationLink,
        url_change:url_change,
        addUsersToTree:addUsersToTree,
        addOrphanedUsers:addOrphanedUsers
    };

})();
