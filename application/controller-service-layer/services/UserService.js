var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
var SendSMS = require('./SendSMSService');
var MLMService = require('./MLMService');
var AuthenticationService = require('./common/AuthenticationService').AuthenticationService;
var neo4jConnection = new neo4j(configurationHolder.config.neo4jUrl);
var fs = require('fs');
var underscore = require('underscore');
UserService = function (app) {
    this.app = app;
};

UserService.prototype = new BaseService();

UserService.prototype.updateUser = function (id, userObj, callback) {
  var birthdate = new Date(userObj.date_of_birth);
  var currentDate = new Date();
  var diff = currentDate - birthdate;
  userObj.age = Math.floor(diff / 31536000000);
  if(userObj){
    // Logger.info("the userObj is",userObj);
    domain.User.findOneAndUpdate({_id: id,deleted: false}, userObj, {new:true}, function (err, user) {
      if (err) {
          Logger.error("Error while updating user.."+err);
          callback(err, null);
      } else {
        console.log("Error ",new Date(),err);
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.userUpdate, user));
      }
    });
  }
}

var uploadChatImage = function(file, serverPath, responseFile,fileName,timeStamp, callback){
      //  Logger.info('code for chatimage upload');
        serverPath = configurationHolder.config.chatImagePath + '/' + fileName;
        fs.rename(
            file.path, serverPath,
            function (err) {
                if (err) {
                    callback(new Error("Something Went Wrong"))
                } else {
                    // Logger.info('success');
                    ffmpeg(serverPath).size('10%').save(configurationHolder.config.chatImagePath + '/' + timeStamp + '_thumbnail.png').on('end', function () {
                        // Logger.info('ddddd')
                        responseFile = {};
                        responseFile.type = 'image';
                        responseFile.imageUrl = configurationHolder.config.imageUrl + 'chatimage/' + fileName;
                        responseFile.thumbnailUrl = configurationHolder.config.imageUrl + 'chatimage/' + timeStamp + '_thumbnail.png';
                        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, responseFile));
                    });
                }
            }
        );
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

UserService.prototype.uploadImage = function (file, type, callback) {
    // Logger.info("Control in the uploadImage servcie layer");
    var timeStamp = new Date().getTime() + Math.floor(Math.random() * 10000);
    var nameSplitArray = file.name.split('.')
    var extension = nameSplitArray[nameSplitArray.length - 1];
    var fileName = timeStamp + '.' + extension;
    var serverPath;
    var responseFile;
    if (type == 'image') { //code for chatimage upload
        uploadChatImage(file,serverPath,responseFile,fileName,timeStamp,callback);
    } else if (type == 'video') {//code for chatVideo upload
        // Logger.info("code for chatvideo upload");
        uploadChatVideo(serverPath,file,fileName,timeStamp,responseFile,callback);
    } else { //code for normal image upload
        // Logger.info("code for normal image upload");
        serverPath = '/opt/Weone/' + fileName;
        responseFile = configurationHolder.config.imageUrl + fileName;
        responseOfUpload(file.path, serverPath, responseFile, callback);
    }
}

var mv = require('mv');
var responseOfUpload = function (filePath, serverPath, responseFile, callback) {
    // Logger.info(filePath, "control in the responseOfUpload", responseFile, serverPath)
    mv(
        filePath, serverPath,
        function (err) {
            if (err) {
                callback(new Error("Something Went Wrong"))
            } else {
                // Logger.info('success');
                callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, responseFile));
            }
        }
    );
}


var sendEmail = function (emailto, subject, emailBody) {
    // Logger.info('control in the sendEmail')
    configurationHolder.EmailUtil.email(configurationHolder.config.emailFrom, emailto, subject, emailBody);
}



UserService.prototype.sendInvitationService = function (mobilenumbers, platform, user, callback) {
    // Logger.info(platform, "control in the send invitation service", mobilenumbers, user._id,user);
    var userName = user.name;
    var referralId = user.referralId;
    var mobNoRawArray=mobilenumbers.split(",");
    var mobileNoArrayWithKey=[];
    for(var i=0;i<mobNoRawArray.length;i++){
          mobileNoArrayWithKey.push({phonenumber:mobNoRawArray[i]});
    }
    var mobileNumberArrayWithKey=removeExtraThingsInContactList(mobileNoArrayWithKey,user.phonenumber);
    var mobileNumberArrayWithNoKey=[];
    for(var i=0;i<mobileNumberArrayWithKey.length;i++){
        mobileNumberArrayWithNoKey.push(mobileNumberArrayWithKey[i].phonenumber)
    }
    domain.User.find({phonenumber:{$in:mobileNumberArrayWithNoKey}},function(err,res){
      // Logger.info("the invited user already in system",res);
      if(!err){
        {
          var list_updated = [];
          var removed_contacts = [];
          async.auto({
            removeContactsAlreadyInSystem:function(next,results){
              mobileNumberArrayWithNoKey.forEach(function(number){
                  var flag=0;
                  // Logger.info("thththt",user.phonenumber);
                  res.forEach(function(user){
                    // Logger.info("nununu",number);
                    if(number == user.phonenumber){
                      flag = 1;
                    }
                  })
                  if(flag!=1){
                    list_updated.push(number);
                  }
                })
                mobileNumberArrayWithNoKey = list_updated;
                next(null);
              },
            isInvitedAlready:['removeContactsAlreadyInSystem',function(next,results){
              if(mobileNumberArrayWithNoKey.length>0){
                domain.User.find({user_invite_people:{$in:mobileNumberArrayWithNoKey}},function(err,doc){
                  if(!err){
                    if(doc.length>0){
                      var link = '';
                      // if (platform == 'android') {
                      //     Logger.info("platform android");
                      //     link = configurationHolder.config.androidapplink;
                      // } else {
                      //     Logger.info("platform ios");
                      //     link = configurationHolder.config.iosapplink;
                      // }
                      link="iPhone- " +configurationHolder.config.iosapplink+"\nAndroid- "+configurationHolder.config.androidapplink;
                      var messageBody = userName+" also wants you to join WeOne. Install it from here\n" + link + "\nUse Referral-Id: "+referralId+configurationHolder.Message.Success.sendInvitationMsgBody2;
                      SendSMS.sendInvitationService(mobilenumbers, messageBody);
                      callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.sendInvitationSuccess, null));
                    }else {
                      next(null);
                    }
                  }
                })
              }else {
                callback(null, SetResponse.setSuccess("This contact has already joined WeOne", null));
              }
            }],
            updateTheInviteList:['isInvitedAlready',function(next,results){
              // Logger.info("the updated list is",mobileNumberArrayWithNoKey,list_updated);
              domain.User.findOneAndUpdate({
                      _id: user._id
                  }, {
                      $addToSet: {
                          user_invite_people: {
                              $each: mobileNumberArrayWithNoKey
                          }
                      }
                  }, {
                      new: true
                  },
                  function (err, userObj) {
                      // Logger.info("after",userObj,user._id);
                      var link = '';
                      // if (platform == 'android') {
                      //     Logger.info("platform android");
                      //     link = configurationHolder.config.androidapplink;
                      // } else {
                      //     Logger.info("platform ios");
                      //     link = configurationHolder.config.iosapplink;
                      // }
                      link="iPhone- " +configurationHolder.config.iosapplink+"\nAndroid- "+configurationHolder.config.androidapplink;
                      var messageBody = "Hi, this is "+userName+", "+configurationHolder.Message.Success.sendInvitationMsgBody1 + "\n"+link + "\nUse Referral-Id: "+referralId+"\n" + configurationHolder.Message.Success.sendInvitationMsgBody2;
                      callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.sendInvitationSuccess, null));
                      SendSMS.sendInvitationService(mobilenumbers, messageBody);
                  });
            }]
          },function(err,result){
            // Logger.info("the removed contacts are",removed_contacts);
          })

        }

      }else {
        // Logger.info("Some error in mongo",err);
        callback(err,SetResponse.setSuccess("Phone number does not exist !"));
      }
    })

}


//Function is used to save New conatct list to domain and if already that contacts exists than update the same list
UserService.prototype.getUserContactsList = function (contactList, user, callback) {
    // Logger.info("Control is in getUserContactsList in UserService ");
		// Logger.info("the contact list is",contactList);
    contactList = removeExtraThingsInContactList(contactList,user.phonenumber);
    domain.User_Phonebook_History.findOneAndUpdate({
      user_id: user._id,
      deleted: false
    }, {phonebook_details: contactList}, {new: true},
    function (err, userEntryObject) {
        if (userEntryObject) {
            // Logger.info("user contact is already exist");
            // callback(null,"");
            makeFriendsviaPhoneBook(userEntryObject, user.phonenumber,  callback)
        } else { //New phonebook entry created
            // Logger.info("New phonebook entry creating..");
            var userId = user._id;
            var usrphonebookObject = new domain.User_Phonebook_History({user_id: userId,phonebook_details: contactList});
            usrphonebookObject.save(function (err, obj) {
                if (obj) {
                    // Logger.info("Phonebook saved successfully...");
                    makeFriendsviaPhoneBook(obj, user.phonenumber, callback);
                } else {
                    callback(SetResponse.setError(configurationHolder.Message.Error.internalServer, 500), null);
                }
            });
        }
    })
}

var removeExtraThingsInContactList = function (contactList, userPhoneNumber) {
    // Logger.info(userPhoneNumber, "control in the remove extra things in contact", contactList.length);
    for (var i = 0; i < contactList.length; i++) {
        var replaceDigit = contactList[i].phonenumber.replace(/\D/g, '');
        if (replaceDigit.length >= 10) {
            contactList[i].phonenumber = '91' + replaceDigit.substr(replaceDigit.length - 10);
        } else
        contactList[i].phonenumber = '91' + replaceDigit;
    }
    contactList.sort(function (a, b) {
        return a.phonenumber - b.phonenumber;
    });
    var uniqueArray = [];
    for (var i = 0; i < contactList.length - 1; i++) {
        if (contactList[i].phonenumber != contactList[i + 1].phonenumber) {
            // Logger.info('match found')
            uniqueArray.push(contactList[i]);
        }
    }
    uniqueArray.push(contactList[i]);
    contactList = uniqueArray;
    var position = null;
    for (var i = 0; i < contactList.length; i++) {
        (contactList[i].phonenumber == userPhoneNumber) ? position = i: Logger.info("no mobile");
    }
    // Logger.info("posi", position);
    if (position != null) {
        Logger.info("splice", contactList.splice(position, 1));
    }

    // Logger.info("the processed contact list is",contactList);
    return contactList;
}

UserService.prototype.getUserFriends = function (user, callback) {

  domain.User.findOne(
    {_id:user._id},
    {hiddenFriends:1,blockFriends:1,friends:1,_id:1,phonenumber:1},
    function(err,user){
      var userObj_id = user._id;
      var blockHidden = [];
      blockHidden.push.apply(blockHidden, user.hiddenFriends);
      blockHidden.push.apply(blockHidden, user.blockFriends);
      // Logger.info("blockHhidden friends ",blockHidden)
      var friendsArray = underscore.difference(user.friends,blockHidden);
      // Logger.info("friendsArray>>>>",friendsArray);
      async.auto({
      friendsObject:function(next, result){
            domain.User.find({_id:{$in:friendsArray.map(function(o){return mongoose.Types.ObjectId(o);})} ,deleted:false, role:"ROLE_USER"
          },{name:1,read_recepit_status:1,view_profile_status:1,image_url:1,phonenumber:1}).lean().exec(function(err,userObject){
                    next(err,userObject)
            });
      },
      hiddenFriends: function(next,result){
          domain.User.find({_id:{$in:user.hiddenFriends.map(function(o){return mongoose.Types.ObjectId(o);})} ,deleted:false,role:"ROLE_USER"
        },{name:1,read_recepit_status:1,view_profile_status:1,image_url:1,phonenumber:1}).lean().exec(function(err,userObject){
                    next(err,userObject)
            });
      },
      blockFriends: function(next,result){
          domain.User.find({_id:{$in:user.blockFriends.map(function(o){return mongoose.Types.ObjectId(o);})} ,deleted:false,role:"ROLE_USER"
        },{name:1,read_recepit_status:1,view_profile_status:1,image_url:1,phonenumber:1}).lean().exec(function(err,userObject){
                    next(err,userObject)
            });
      }

        },function(err, results){
       /*   if(!results.friendsObject){
            results.friendsObject = [];
          }*/
         /* if(!results.hiddenFriends){
            results.hiddenFriends = [];
          }
          if(!results.blockFriends){
            results.blockFriends = [];
          }*/

            var userObject = results.friendsObject;
            if (results) {
              var friendsarray = [];
              for (var i = 0; i < results.friendsObject.length; i++) {
                  if (results.friendsObject[i].phonenumber)
                      friendsarray.push(results.friendsObject[i]._id);
              }
              //Logger.info("total number of friends", friendsarray.length);
              pubSubFunction.from_user = user._id;
              domain.Chat_Channel.find({
                   from_user: user._id,
                   to_user: {$in:friendsarray.map(function(o){return mongoose.Types.ObjectId(o);})}
              }).exec(function (err, chatChannelObject) {

                       var object = {};
                       var friendObject = [];
                       if(chatChannelObject){
                         var chatChannelMap = {};
                           for(var i=0; i< chatChannelObject.length;i++){
                              var friend = underscore.find(results.friendsObject, function(friendObjectSelection){
                                return friendObjectSelection._id.toString() == chatChannelObject[i].to_user;
                              });
                              friendObject.push({
                              publish_topic: chatChannelObject[i].publish_topic,
                              subscribe_topic: chatChannelObject[i].subscribe_topic,
                              phonenumber:friend.phonenumber,
                              name: friend.name,
                              image_url: friend.image_url,
                              _id: friend._id,
                              view_profile_status: friend.view_profile_status,
                              read_recepit_status:friend.read_recepit_status
                            })
                            chatChannelMap[friend._id] = chatChannelObject[i];
                              //Logger.info("chatChannelObject to_user " + i,results.friendsObject[i]);
                           }

                          object.friendObject = friendObject;
                          object.hiddenFriends = results.hiddenFriends;
                          object.blockFriends = results.blockFriends;
                          async.auto({
                            sortByTimestamp:function(next, result){
                              return sortFriendsByTimestamp(userObj_id, friendObject, next);
                            },
                            add_friends_without_pubsub:['sortByTimestamp',function(next, result){
                              async.forEach(userObject, function(friend,pass){
                                if(!chatChannelMap[friend._id]){
                                  result.sortByTimestamp.push({
                                    publish_topic: "null",
                                    subscribe_topic: "null",
                                    phonenumber:friend.phonenumber,
                                    name: friend.name,
                                    image_url: friend.image_url,
                                    _id: friend._id,
                                    view_profile_status: "null",
                                    read_recepit_status:"null"
                                  })
                                }
                                pass();
                              },function(err){
                                next(null,result.sortByTimestamp)
                              })
                            }]
                          },function(err, results){
                            //Logger.info("the sortByTimestamp res",results.sortByTimestamp);
                            // object.friendObject = results.sortByTimestamp;
                            object.friendObject = results.add_friends_without_pubsub
                            return callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.userFriendsList, object));
                          })
                       }
              });
          }
        })
  })
}

var pubSubFunction = {
        getPubSub: function (to_user, callback) {
            // Logger.info("get pub sub");
            var from_user = this.from_user;
            domain.Chat_Channel.findOne({
                from_user: from_user,
                to_user: to_user
            }).lean().exec(function (err, chatChannelObject) {
                if (chatChannelObject) {
                    return callback(null, chatChannelObject);
                } else {
                    // Logger.info("no pub sub find");
                    return callback(null, "No chat channel");
                }
            });
        }
    }
    //Function is used to makeFriends via phonebook of user
var makeFriendsviaPhoneBook = function (phoneBookObject, userPhoneNumber, callback) {
        // Logger.info("id is...", phoneBookObject.user_id)
        // Logger.info("The phonebook data",phoneBookObject);

        domain.User_Phonebook_History.find({
                "phonebook_details.phonenumber": userPhoneNumber
            }).lean().exec(
            function (err, object) {
                // var friendsList = []
                // for (var i = 0; i < object.length; i++) {
                //     friendsList.push(object[i].user_id)
                // }
                var friendsList = object.map(function(phoneBook){
                  return phoneBook.user_id;
                })
                var users_map = {};

                domain.User.find({_id:{$in:friendsList}},{phonenumber:1}).lean().exec(function(err,users){
                  async.forEach(users, function(user, pass){
                    users_map[user._id] = user.phonenumber;
                    pass();
                  },function(err){
                    // callback(null,"done");
                      reverseSerachOfFriends(friendsList, phoneBookObject, users_map, callback);
                  })
                })




            });

  // domain.User.findOne({
  //           _id: phoneBookObject.user_id,
  //           deleted: false
  //       }, function (err, userObject) {
  //           var userPhoneNumber = userObject.phonenumber;
  //           domain.User_Phonebook_History.find({
  //                   "phonebook_details.phonenumber": userPhoneNumber
  //               },
  //               function (err, object) {
  //                   var friendsList = []
  //                   for (var i = 0; i < object.length; i++) {
  //                       friendsList.push(object[i].user_id)
  //                   }
  //                   reverseSerachOfFriends(friendsList, phoneBookObject, callback);
  //               });
  //       });
    }
    //reverse search friends
    var reverseSerachOfFriends = function (friendsList, phoneBookObject, users_map, callback) {
        // Logger.info("reverseSerachOfFriends called...", friendsList.length);
        var finalFriendList = [];
        async.map(friendsList, function (userid, callback) {

          if (users_map[userid]) {
              domain.User_Phonebook_History.count({"user_id": phoneBookObject.user_id,"phonebook_details.phonenumber": users_map[userid]}).lean().exec(
              function (error, phoneObject) {
                  if (phoneObject>0) {
                      domain.User.findOneAndUpdate({_id: userid,deleted: false}, {
                          $addToSet: {
                              friends: phoneBookObject.user_id
                          }
                      }, function (errr, obj) {
                          finalFriendList.push(userid);
                          createChannel(userid, phoneBookObject.user_id, userid + "topic" + phoneBookObject.user_id, phoneBookObject.user_id + "topic" + userid, callback);
                      });
                  } else {
                      // Logger.info("Error occured in finding number in phonebook in reverseSerachOfFriends method ", error);
                      callback(null, "error");
                  }
              });
          } else {
              // Logger.info("error in reverse serach of friends no userObject is found");
              callback(null, "userObject is not found in reverse serach");
          }

            // domain.User.findOne({_id: userid, deleted: false}, function (err, userObject) {
            //     if (userObject) {
            //         domain.User_Phonebook_History.findOne({"user_id": phoneBookObject.user_id,"phonebook_details.phonenumber": userObject.phonenumber}, function (error, phoneObject) {
            //             if (phoneObject) {
            //                 domain.User.findOneAndUpdate({_id: userid,deleted: false}, {
            //                     $addToSet: {
            //                         friends: phoneBookObject.user_id
            //                     }
            //                 }, function (errr, obj) {
            //                     finalFriendList.push(userid);
            //                     createChannel(userid, phoneBookObject.user_id, userid + "topic" + phoneBookObject.user_id, phoneBookObject.user_id + "topic" + userid, callback);
            //                 });
            //             } else {
            //                 Logger.info("Error occured in finding number in phonebook in reverseSerachOfFriends method ", error);
            //                 callback(null, "error");
            //             }
            //         });
            //     } else {
            //         Logger.info("error in reverse serach of friends no userObject is found");
            //         callback(null, "userObject is not found in reverse serach");
            //     }
            // });
        }, function (err, result) {
            // Logger.info("updating....user in reverseSerachOfFriendsss*", finalFriendList.length);
            domain.User.findOneAndUpdate({_id: phoneBookObject.user_id}, {
                $addToSet: {
                    friends: {
                        $each: finalFriendList
                    }
                }
            }, function (err, usrObj) {
                if (usrObj) {
                    // Logger.info("FriendList is added to " + phoneBookObject.user_id + " user upadted saved sucess");
                    async.map(finalFriendList, function (userid, callback) {
                        createChannel(phoneBookObject.user_id, userid, phoneBookObject.user_id + "topic" + userid, userid + "topic" + phoneBookObject.user_id, callback);
                    }, function (err, result) {
                        if (result)
                            Logger.info("chanel created successfully");
                    });
                } else {
                    // Logger.info("Error occured in updating user..", err);
                }
            });
        });
        callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.userFriendsAdded, null));
    }

var createChannel = function (from_user, to_user, publish_topic, subscribe_topic,callback) {
    // Logger.info("control in the create channel");
    domain.Chat_Channel.count({from_user: from_user,to_user: to_user},function(err,channelCount){
      if(channelCount==0){
        domain.Chat_Channel.update({from_user: from_user,to_user: to_user},
          {$set:{from_user: from_user,to_user: to_user,publish_topic: publish_topic,subscribe_topic: subscribe_topic}},
          function (err, doc) {
            // Logger.info("updating from update command",err, doc);
            if (doc.n>0) {
              // Logger.info("updating from update command inside if");
                // Logger.info("Updating existing..");
            } else {
                var chatChannelObject = new domain.Chat_Channel({from_user: from_user,to_user: to_user,publish_topic: publish_topic,subscribe_topic: subscribe_topic,});
                chatChannelObject.save(function (err, chatObj) {
                    if (chatObj) {
                        // Logger.info("chatObj is saved");
                        var client = mqtt.connect(configurationHolder.config.mqttUrl, {
                            clientId: from_user.toString(),
                            clean: false
                        });
                        client.on('connect', function () {
                            var chanelobj = {};
                            chanelobj[subscribe_topic] = 1;
                            client.subscribe(chanelobj, function (err, granted) {
                            if (err) Logger.info("error while subscribing..", err);
                            else if (granted) Logger.info("granted...", granted);
                            client.end();
                            });
                      });
                    } else Logger.info("Error while saving chatObject..", err);
                });
            }
            callback(null,from_user);
          });
      }else {
        callback(null,from_user);
      }
    })

}

UserService.prototype.changeAppStatus = function (status, user, callback) {
    // Logger.info(user._id, "status app", status);
    domain.User.findOneAndUpdate({_id: user._id,deleted: false}, {device_status: status}, {new: true}, function (err, userObject) {
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.applicationStatus, {
            device_status: status
        }));
    });
}


UserService.prototype.userSettingsService = function (settingObject, callback) {
    // Logger.info("control in the user setting service", settingObject);
    domain.User.findOneAndUpdate({_id: settingObject.user_id,deleted: false}, {
        notification_status: settingObject.notification_status,
        last_seen_status: settingObject.last_seen_status,
        view_profile_status: settingObject.view_profile_status,
        read_recepit_status:settingObject.read_recepit_status
    }, {new: true}, function (err, userObject) {
        if (userObject) {
            callback(err, SetResponse.setSuccess("setting user", {
                notification_status: userObject.notification_status,
                last_seen_status: userObject.last_seen_status,
                view_profile_status: userObject.view_profile_status,
                read_recepit_status:userObject.read_recepit_status
            }));
        }
    });
}

UserService.prototype.getUserProfileService = function (userid, callback) {
    // Logger.info("control in the user service", userid);
    domain.User.findOne({_id: userid,deleted: false}, {phonenumber: 1,gender: 1,name: 1,image_url: 1}).lean().exec(function (err, userObject) {
        callback(err, SetResponse.setSuccess("user profile", userObject));
    })
}

UserService.prototype.blockUserService = function (userId, friendId, blockUnblockFlag, callback) {
    // Logger.info(userId, "control in the block user", friendId, blockUnblockFlag);
    if (blockUnblockFlag == true) {
        // Logger.info("call for block the user");
        blockUser(userId, friendId, callback);
    } else {
        // Logger.info("call for unblock the user");
        unBlockUser(userId, friendId, callback);
    }
}

var blockUser = function (userId, friendId, callback) {
    // Logger.info("block user call");
    domain.User.findOneAndUpdate({_id: userId}, {
        $pull: {friends: friendId},
        $addToSet: {blockFriends: friendId}
    }, function (err, userObject) {
        if (err) {
            // Logger.info("error in blocking user", err);
        } else {
            domain.User.findOneAndUpdate({_id: friendId,}, {
                $pull: {friends: userId},
                $addToSet: {hiddenFriends: userId}
            }, function (err, friendObject) {
                if (err)   Logger.info("error in add to hidden friend user", err);
                 else  callback(err, SetResponse.setSuccess("User blocked successfully", null));
            });
        }
    });
}

var unBlockUser = function (userId, friendId, callback) {
    // Logger.info("unblock user call");
    domain.User.findOneAndUpdate({_id: userId}, {
        $addToSet: {friends: friendId},
        $pull: {blockFriends: friendId}
    }, function (err, userObject) {
        if (err) {
            // Logger.info("error in unblocking user", err);
        } else {
            domain.User.findOneAndUpdate({_id: friendId,}, {$addToSet: {friends: userId},
                $pull: {hiddenFriends: userId}
            }, function (err, friendObject) {
                if (err)    Logger.info("error in add to unhidden friend user", err);
                 else  callback(err, SetResponse.setSuccess("User unblocked successfully", null));
            });
        }
    });
}

UserService.prototype.getBlockUserService = function (userId, callback) {
    // Logger.info("control in the get user service", userId);
    domain.User.findOne({_id: userId}, {blockFriends: 1}).populate("blockFriends", "name phonenumber image_url").lean().exec(function (err, userObjects) {
        callback(err, SetResponse.setSuccess("block users", userObjects));
    })
}

UserService.prototype.userLastSeenService = function (userId, callback) {
    // Logger.info("control in the userlastseen service ", userId);
    domain.User.findOneAndUpdate({_id: userId,deleted: false},
    {last_seen_time: new Date()},
    {new: true}, function (err, userObject) {
       callback(err, SetResponse.setSuccess("last seen", userObject.last_seen_time));
    })
}

UserService.prototype.getUserLastSeenService = function (userId, callback) {
    // Logger.info("Control in the get User last seen service", userId);
    domain.User.findOne({_id: userId}, {last_seen_time: 1,last_seen_status: 1}).lean().exec(function (err, userObject) {
        // Logger.info(userObject.last_seen_time, "last seen status", userObject.last_seen_status)
        if (userObject.last_seen_status == true && userObject.last_seen_time != "Thu Jan 01 1970 05:30:00 GMT+0530 (IST)" && userObject.last_seen_time&&userObject.last_seen_time !="Thu Jan 01 1970 00:00:00 GMT+0000 (UTC)") {
            callback(err, SetResponse.setSuccess("last seen", {
                last_seen_time: userObject.last_seen_time
            }));
        } else {
            callback(err, SetResponse.setSuccess("last seen", {last_seen_time: false}));
        }
    });
}

UserService.prototype.addUnderInviter = function (data, callback) {

  var inviter_phone = data.inviter_phone;
  var invitee_phone = data.invitee_phone;

  domain.User.findOne({phonenumber:invitee_phone},function(err,userObj){
    // Logger.info("the invitee is",err,userObj);
    if(!err){
      domain.User.findOneAndUpdate({phonenumber: inviter_phone},
        {$inc: {user_invited_people_count: 1}},function(err,result){
          if(!err){
            if (result) {
                // Logger.info("the inviter is",err,result);
                AuthenticationService.generateAuthenticationToken(userObj, callback);
                // it will add the user object in to mlm
                MLMService.createUserNode(userObj,result);
            }else {
              callback(new Error());
            }
          }else {
            callback(new Error());
          }
      })
    }else {
      callback(new Error());
    }
  })
}

UserService.prototype.sendGlobalPushNotifications = function (data, callback) {

// Logger.info("the body is",data);
var message = data.message;
var type = data.type;
var selected=data.selectedAll;
if(selected ){
    async.auto({
      saveNotificationInDb:function(next, results){
       saveNotificationWithCallback({
             app_platform: 'ios/android',
             device_token: 'multiple',
             is_send_to_all:true,
             notification_type:type,
             notification_message: message,
             time_stamp: new Date().getTime()
         },next);
      },
      sendNotificationRecursively:['saveNotificationInDb',function(next, results){
        // Logger.info("Next step",results);
       if(results.saveNotificationInDb){
         var skip = 0;
         var limit = 10000;
         var counter = limit;
         domain.User.count({deleted:false,role:'ROLE_USER'},function(err,count){
          //  Logger.info("Number of users",count);
           if(!err){
             var total_users = count;
             notification_recursively(skip, limit, total_users, counter, message, type);
           }
         })
         callback(null, SetResponse.setSuccess("success"));
       }else {
         callback(err,SetResponse.setSuccess("Some error has occurred !"));
       }

      }]
      },function(err,results){
      // Logger.info("Completed");

  })
}else {
  // Logger.info("not sendin too all the users");
    var users = data.users;
    users.forEach(function(id){
    domain.User.findOne({_id:id},{_id:1,registration_token:1,app_platform:1},function(err,obj){
      var app_platform = obj.app_platform;
      if (app_platform == "ios") {
          PushService.apnsPushNotification(obj._id, message, obj.registration_token, type);
      } else if (app_platform == "android") {
          PushService.gcmPushNotification(message, obj.registration_token, type);
      } else {
        // Logger.info("invalid platform");
      }
      saveNotification({
          app_platform: app_platform,
          device_token: obj.registration_token,
          user_id: obj._id,
          notification_type: type,
          notification_message: message,
          time_stamp: new Date().getTime()
      });
    })
  });
  callback(null, SetResponse.setSuccess("success"));
}
}

var notification_recursively = function(skip, limit, total_users, counter, message, type){
  // Logger.info("skip limit total_users counter",skip, limit, total_users, counter);
  domain.User.find({role:'ROLE_USER',deleted:false},
  {_id:1,registration_token:1,app_platform:1}).skip(skip).limit(limit).exec(
    function(err,users){
        //  Logger.info("uaweaa",users.length);

         var androidCounter = 0;
         var iosCounter = 0;
         var bulkSize = 900;

         var registration_tokens_android = [];
         var registration_tokens_ios = [];

         async.forEach(users, function(user, next){
           var app_platform = user.app_platform;
           if (app_platform == "ios") {
            //  Logger.info("Sent Push Notification in ios");
             if(iosCounter<bulkSize){
               registration_tokens_ios.push(user.registration_token)
               iosCounter++;
             }else {
               PushService.apnsBulkPushNotification(message, registration_tokens_ios, type);
               iosCounter = 1;
               registration_tokens_ios = [];
               registration_tokens_ios.push(user.registration_token);
             }

           } else if (app_platform == "android") {
             Logger.info("Sent Push Notification in android");
             if(androidCounter<bulkSize){
               registration_tokens_android.push(user.registration_token)
               androidCounter++;
             }else {
               PushService.gcmPushNotification(message, registration_tokens_android, type);
               androidCounter = 1;
               registration_tokens_android = [];
               registration_tokens_android.push(user.registration_token);
             }
           } else {
            //  Logger.info("invalid platform");
           }
           next();
         },function(err){
            // Logger.info("Completed");
            if(androidCounter>0){
              PushService.gcmPushNotification(message, registration_tokens_android, type);
            }
            if(iosCounter>0){
              PushService.apnsBulkPushNotification(message, registration_tokens_ios, type);
            }
            if(counter<total_users){
              skip = skip + limit;
              if((counter+limit)>total_users){
                limit = total_users
              }
              counter = counter + limit;
              notification_recursively(skip, limit, total_users, counter, message, type);
            }else {
              // Logger.info("All Notifications Sent Successfully");
            }
         })
     })
}

UserService.prototype.deleteRequest = function (token, otp, deleteRequest, callback) {
  var resData = {};
  resData.deleteRequestSuccessful = deleteRequest;
    domain.Authentication_Token.findOne({authToken: token,deleted: false},function(err,obj){
      if(!err){
        domain.User.findOne({_id:obj.user},function(err,user){
          if(!err){
            domain.DeleteRequests.findOne({user:obj.user},function(err,req){
              if(!err){
                if(req){
                  if(req.status == 'PENDING'){
                    if(!deleteRequest){
                      domain.DeleteRequests.update({user:obj.user},{$set:{status:'CANCELLED'}},function(err,req_update){
                        if(!err){
                          callback(null, SetResponse.setSuccess("Your Request for the Account Deletion has been Cancelled.",resData));
                        }else {
                          callback(new Error("Internal Server Error"))
                        }
                      })
                    }else {
                      callback(null, SetResponse.setSuccess("Your Request is under process",resData));
                    }
                  }else if(req.otp == otp){
                    domain.DeleteRequests.update({user:obj.user},{$set:{status:'PENDING'}},function(err,req_update){
                      if(!err){
                        callback(null, SetResponse.setSuccess("Your Request for the Account Deletion is sent to the Admin for the approval.",{OTPMatched:true,deleteRequestSuccessful:true}));
                      }else {
                        callback(new Error("Internal Server Error"))
                      }
                    })
                  }else {
                    callback(null, SetResponse.setSuccess("OTP is not correct.",{OTPMatched:false,deleteRequestSuccessful:false}));
                  }
                }else {
                  callback(new Error("Internal Server Error"))
                }
              }else {
                callback(new Error("Internal Server Error"))
              }
            })
          }else {
            callback(new Error("Internal Server Error"))
          }
        })
      }else {
        callback(new Error("Some error"))
      }
    })
}

UserService.prototype.update_email = function (token, otp, callback) {
    domain.Authentication_Token.findOne({authToken:token},function(err,obj){
      if(!err){
        domain.User.findOne({_id:obj.user},function(err,user){
          if(!err){
            var query = "MATCH (n:user) where ID(n)="+user.neo4J_node_id+" SET ";
            if(otp==user.otp_code_email_update){
              // Logger.info("otp is matched",user.updated_email);
              domain.User.update({_id:obj.user},{$set:{email:user.updated_email,updated_email:''}},function(err,res){
                // Logger.info("the res is",err,user);
                if(!err){
                  query = query + " n.email = '"+user.updated_email+"'";
                  // Logger.info("the cipher",query);
                  neo4jConnection.cypherQuery(query,function(err,res){
                      // Logger.info("the cql res is",err,res);
                       if(!err){
                        //  Logger.info("updated in neo4j");
                           callback(null, SetResponse.setSuccess("Your email has been updated",{newEmail:user.updated_email,OTPMatched:true,emailChangeSuccessful:true}));
                       }else {
                         callback(err,SetResponse.setSuccess("Some error has occurred !"));
                       }
                     })
                }else {
                  callback(err,SetResponse.setSuccess("Some error has occurred !"));
                }
              })
            }else {
              callback(null, SetResponse.setSuccess("OTP is not correct. Please try again.",{OTPMatched:false,emailChangeSuccessful:false}));
            }
          }else {
            callback(err,SetResponse.setSuccess("Some error has occurred !"));
          }
        })
      }else {
        callback(err,SetResponse.setSuccess("Some error has occurred !"));
      }
    })

}

UserService.prototype.fetch_delete_requests = function (limit,skip,callback) {
    domain.DeleteRequests.find({status:{$in:['PENDING','CANCELLED']}})
    .skip(skip)
    .limit(limit)
    .populate('user')
    .exec(function(err,deleteRequests){
      if(!err){
        var resData = {};
        resData.deleteRequests = deleteRequests;
        if(skip!=0){
// Logger.info("skip is not equal to 0");
          callback(null, SetResponse.setSuccess("Success",resData));
        }
        else {
          domain.DeleteRequests.find({status:{$in:['PENDING','CANCELLED']}})
          .count(function(err,count){
            resData.count=count;
            callback(null, SetResponse.setSuccess("Success",resData));

          })
        }

      }else {
        // Logger.info("the error:",err);
        callback(err,SetResponse.setSuccess("Some error has occurred !"));
      }
    })
}

UserService.prototype.set_delete_requests = function (data, token, callback) {
    var status = data.status;
    var user = data.user;
    var phonenumber = data.phonenumber;

    if(status == false){
      domain.DeleteRequests.update({user:user},{$set:{status:'CANCELLED'}},function(err,res){
        if(!err){
          domain.User.findOne({_id:user},function(err,userObj){
            if(!err){
              var message = "Your request for the Account Deletion has been Cancelled.";
              var app_platform = userObj.app_platform;
              if (app_platform == "ios") {
                  PushService.apnsPushNotification(userObj._id, message, userObj.registration_token, "global");
              } else if (app_platform == "android") {
                  PushService.gcmPushNotification(message, userObj.registration_token, "global");
              } else {
                // Logger.info("invalid platform");
              }
              saveNotification({
                  app_platform: app_platform,
                  device_token: userObj.registration_token,
                  user_id: user,
                  notification_type: "global",
                  notification_message: message,
                  time_stamp: new Date().getTime()
              });
              SendSMS.generalMessage(phonenumber,message);
              callback(null, SetResponse.setSuccess("Successfully Cancelled the Delete Request."));
            }else {
              callback(err,SetResponse.setSuccess("Some error has occurred !"));
            }
          })

        }else {
          // Logger.info("ERROR:",err);
          callback(err,SetResponse.setSuccess("Some error has occurred !"));
        }
      })
    }else if(status == true){
      domain.DeleteRequests.update({user:user},{$set:{status:'DELETED'}},function(err,res){
        if(!err){
          domain.User.findOneAndUpdate({_id: user,deleted: false}, {deleted: true,phonenumber: '',email: '',otp_code: ''}, null, function (err, deleObj) {
            // Logger.info("the resp is",err,deleObj);
              if(!err){
                if(deleObj){
                  neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)=" + deleObj.neo4J_node_id + " set n.deleted=true", function (err, obj) {
                      if(!err){
                        // Logger.info("Status changed in neo4j");
                        var message = "Your WeOne account has been deleted successfully.";
                        var app_platform = deleObj.app_platform;
                        if (app_platform == "ios") {
                            PushService.apnsPushNotification(deleObj._id, message, deleObj.registration_token, "global");
                        } else if (app_platform == "android") {
                            PushService.gcmPushNotification(message, deleObj.registration_token, "global");
                        } else {
                          // Logger.info("invalid platform");
                        }
                        saveNotification({
                            app_platform: app_platform,
                            device_token: deleObj.registration_token,
                            user_id: user,
                            notification_type: "global",
                            notification_message: message,
                            time_stamp: new Date().getTime()
                        });
                        SendSMS.generalMessage(phonenumber,message);
                        domain.Authentication_Token.remove({user:user},function(err,del){
                          if(!err){
                            // Logger.info("Deleted the Token",err,del);
                          }else {
                            // Logger.info("Some error in deleting the token");
                          }
                        })
                        callback(null, SetResponse.setSuccess("Successfully Deleted the User Account."));
                      }else {
                        // Logger.info("Some error in updating the node in neo4j",err);
                        callback(SetResponse.setSuccess("Some error has occurred !"), null);
                      }
                  });
                }else {
                  callback(null, SetResponse.setSuccess("Successfully Deleted the User Account."));
                }
              } else {
                // Logger.info("Some error in mongo update",err);
                callback(err,SetResponse.setSuccess("Some error has occurred !"));
              }
          });
        }else {
          // Logger.info("ERROR:",err);
          callback(err,SetResponse.setSuccess("Some error has occurred !"));
        }
      })
    }

}

var saveNotification = function (notificationObject) {
    // Logger.info("Notification saved");
    var Notification_History_object = new domain.Notification_History(notificationObject);
    Notification_History_object.save(function (err, savedHistoryOjbect) {
        // Logger.info(err, "Notification history saved");
    });
}

var saveNotificationWithCallback = function (notificationObject, next) {
    // Logger.info("Notification saved");
    var Notification_History_object = new domain.Notification_History(notificationObject);
    Notification_History_object.save(function (err, savedHistoryOjbect) {
        // Logger.info(err, "Notification history saved");
        if(!err){
          next(err,savedHistoryOjbect)
        }else {
          next(null);
        }
    });
}

UserService.prototype.delete_request_status = function (token, callback) {
    domain.Authentication_Token.findOne({authToken:token},function(err,obj){
      if(!err){
        domain.DeleteRequests.findOne({user:obj.user},function(err,request){
          if(!err){
            if(request){
              // Logger.info("the req is,",request.status);
              if(request.status){
                callback(null, SetResponse.setSuccess("Success",{status:request.status}));
              }else {
                callback(null, SetResponse.setSuccess("Success",{status:'NOT_APPLICABLE'}));
              }
            }else {
              Logger.info("the response is null");
              callback(null, SetResponse.setSuccess("Success",{status:'NOT_APPLICABLE'}));
            }
          }else {
            callback(err,SetResponse.setSuccess("Some error has occurred !"));
          }
        })
      }else {
        callback(err,SetResponse.setSuccess("Some error has occurred !"));
      }
    })
}

UserService.prototype.edit_comments = function(data, callback){
  var comment_id = data.comment_id;
  var updated_comment = data.updated_comment;

  domain.Comment_History.update({comments:{$elemMatch:{_id:comment_id}}},{$set:{'comments.$.comment':updated_comment}},function(err, res){
    if(!err){
      callback(null, SetResponse.setSuccess("Review Updated Successfully",{isUpdatedComment:true}));
    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })
}

UserService.prototype.delete_comment = function(data, callback){
  var comment_id = data.comment_id;
  domain.Comment_History.findOneAndUpdate({comments:{$elemMatch:{_id:comment_id}}},{'comments.$.isDeleted':true},function(err, res){
    if(!err){
      // Logger.info("the res is",res);
      domain.Advert.findOneAndUpdate({_id:res.ad_id},
          {$inc: {number_of_comments: -1}
            }, function (err, adobj) {
              callback(null, SetResponse.setSuccess("Review Deleted Successfully",{isDeletedComment:true}));
          });
    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })
}

var sortFriendsByTimestamp = function(user_id, friends, super_next){

  async.auto({
    addFinalMessageInFriends:function(next, result){
      return addFinalMessage(user_id, friends, next)
    },
    sortByTimestamp:['addFinalMessageInFriends',function(next, result){
     // Logger.info("addFinalMessage",result.addFinalMessageInFriends);
      friends = result.addFinalMessageInFriends;
      return descendingSort(friends,next)
    }]
  },
  function(err,results){
   // Logger.info("sortByTimestamp",results.sortByTimestamp);
    super_next(null,results.sortByTimestamp);
  })
}

var descendingSort = function(friends, next){
  var sorted = [];
  var iteration = 0;
  async.forEach(friends, function(firstVar, callback1){
    var counter = 0;
    async.forEach(friends, function(secondVar, callback2){
      if(counter>iteration){
        if(friends[iteration].timeStamp < friends[counter].timeStamp){
         // Logger.info("SWAPPING");
	 // Logger.info("COUNTER & ITERATION ",counter,iteration);
          var temp = friends[iteration];
          friends[iteration] = friends[counter];
          friends[counter] = temp;
        }
      }
      counter++;
     // Logger.info("COUNTER" ,counter);
      callback2();
    },
    function(err){
      iteration++;
     // Logger.info("ITERATION ",iteration);
      callback1();
    })
  },
  function(err){
    next(null,friends);
  })
}



var addFinalMessage = function(user_id, friends, next){
  async.forEach(friends, function(friend, callback){
    var topic_id = user_id+"topic"+friend._id;
    domain.Chat_History.findOne({topic_ids:topic_id},function(err,history){
      if(!err && history){
        domain.Chat_Bucket.findOne({_id:history.current_chat_bucket},function(err,bucket){
          if(!err && bucket){
            friend.finalMessage = bucket.messages[bucket.bucket_count-1];
            friend.timeStamp = parseInt(bucket.messages[bucket.bucket_count-1].timeStamp);
            // Logger.info("The time stamp is",friend.timeStamp);
            callback();
          }else {
            friend.finalMessage = {
              "thumbnailUrl": "",
              "fileUrl": "",
              "message": "",
              "user_id": "",
              "_id": "",
              "timeStamp": "",
              "messageType": "text"
            };
           // friend.timeStamp = 0;
            // Logger.info("No message and error is",err);
            callback();
          }
        })
      }else {
        friend.finalMessage = {
          "thumbnailUrl": "",
          "fileUrl": "",
          "message": "",
          "user_id": "",
          "_id": "",
          "timeStamp": "",
          "messageType": "text"
        };
       // friend.timeStamp = 0;
        // Logger.info("No message and error is",err);
        callback();
      }
    })
  },function(err){
    next(null,friends);
  })
}

UserService.prototype.generateVoucher = function(userid,voucherData,res,callback){

  var voucher = new domain.Voucher(voucherData);
  voucher.user_id = userid;
  voucher.endDate = new Date(voucherData.endDate);
  voucher.startDate = new Date(voucherData.startDate);
  voucher.save(function(err,obj){
    if(err){
      callback(err);
    } else {
     callback(null, SetResponse.setSuccess("Success",obj));
   }
 });
}

UserService.prototype.getVouchers = function(userId,skip,limit,callback){
  // Logger.info("userid",userId);
  domain.Voucher.find({user_id:userId, amount:{$gt:0}},function(err,vouchers){
    // Logger.info("aaaa",err,vouchers);
    if(err){
      callback(err);
    } else {
      callback(null,SetResponse.setSuccess("Success",vouchers))
    }
  }).skip(skip).limit(limit);
}

UserService.prototype.getReceiptAmount = function(userid,voucherData,res,callback){
	// Logger.info("start date",voucherData.startDate,"end date",voucherData.endDate);
  var voucher = {};
  voucher.user_id = userid;
  voucher.endDate = new Date(voucherData.endDate);
  voucher.startDate = new Date(voucherData.startDate);
  //Logger.info("aaaaa",voucher);
  domain.User_Earning_Bucket.aggregate(
    [
      {
        $match:{
          user_id:mongoose.Types.ObjectId(userid.toString()),//userid,
          date_of_earning:{$gte:voucher.startDate,$lte:voucher.endDate}
	  //date_of_earning:{$lte:new Date("2016-11-01T00:00:38.160Z"),$gte:new Date("2016-09-08T00:00:00.160Z")}
        }
      },
      {
        $group:{
          _id:1,
          totalAmount: { $sum: "$total_amount" }
        }
    }],function(err,results){
        // Logger.info("the response is",err,results);
        if(results.length>0){
          var responseAmount = parseInt(results[0].totalAmount.toFixed());//Math.round(results[0].totalAmount * 100) / 100;      //parseInt(.toFixed())
        }else {
          var responseAmount = 0;
        }
        callback(null, SetResponse.setSuccess("The money generated till date is",{amount:responseAmount}));
  })
}
var decryptInformation = function(userId,value){
   const decipher = crypto.createDecipher('aes192', userId)
   var decrypted = decipher.update(value,'hex','utf8')
   decrypted += decipher.final('utf8');
   return decrypted;
}
UserService.prototype.getUserBankDetailByToken = function (user,callback) {
  // Logger.info("id is ",user._id);
  domain.User_Account_Details.findOne({"user":user._id},function(err,user){
  //  Logger.info("user is",user);
    if(!err && user){
      user = JSON.parse(JSON.stringify(user));
      if(user.proof_image){
        user.proof_image = JSON.stringify(user.proof_image)
      }
      // if(user.acc_no != null){
      //   user.acc_no=decryptInformation(user.user,user.acc_no);
      // }
      // if(user.ifsc_code != null){
      //   user.ifsc_code=decryptInformation(user.user,user.ifsc_code);
      // }
      // if(user.pan_card_no != null){
      //   user.pan_card_no=decryptInformation(user.user,user.pan_card_no);
      // }

      callback(err, SetResponse.setSuccess("user with its bank detail",user));
    }else {
      callback(err, SetResponse.setSuccess("Please fill your Account Information",{}));
    }
  })
}
UserService.prototype.getUserBankDetail = function (skip,limit,callback) {
  var results={};
  domain.User_Account_Details.count({},function(err,count){
    if(count>0){
      domain.User_Account_Details.find({})
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .sort('created')
        .populate('user')
        .exec(function(err,user){
          if(!err && user){

          results.object=user;
          results.count=count;
  callback(err, SetResponse.setSuccess("user with its bank detail",results));
  }
  else{
    callback(err, SetResponse.setSuccess("No user exist",null));
  }
    })
  }
  else {

    callback(err, SetResponse.setSuccess("No user exist",null));

  }

    })
}
UserService.prototype.getUserBankDetailById = function (userId,callback) {
  // Logger.info("id is ",userId);
  domain.User_Account_Details.findOne({"user":userId})
  .populate('user')
  .exec(function(err,user){
  //  Logger.info("user is",user);
    if(!err && user){
      callback(err, SetResponse.setSuccess("user with its bank detail",user));
    }else {
      callback(err, SetResponse.setSuccess("Please fill your Account Information",null));
    }
  })
}

UserService.prototype.getUserBankDetail = function (skip,limit,callback) {
  var results={};
  domain.User_Account_Details.count({},function(err,count){
    if(count>0){
      domain.User_Account_Details.find({})
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .sort('created')
        .populate('user')
        .exec(function(err,user){
          if(!err && user){

          results.object=user;
          results.count=count;
  callback(err, SetResponse.setSuccess("user with its bank detail",results));
  }
  else{
    callback(err, SetResponse.setSuccess("No user exist",null));
  }
    })
  }
  else {
    callback(err, SetResponse.setSuccess("No user exist",null));
  }
})
}

UserService.prototype.getUserBankDetailById = function (userId,callback) {
  // Logger.info("id is ",userId);
  domain.User_Account_Details.findOne({"user":userId})
  .populate("user","name phonenumber email location")
  .exec(function(err,user){
    if(!err && user){
      callback(err, SetResponse.setSuccess("user with its bank detail",user));
    }else {
      callback(err, SetResponse.setSuccess("Please fill your Account Information",null));
    }
  })
}


module.exports = function (app) {
    return new UserService(app);
};
