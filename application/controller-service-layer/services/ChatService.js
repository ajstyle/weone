var BaseService = require('./BaseService');
var AuthenticationService = require('./common/AuthenticationService').AuthenticationService;
ChatService = function (app) {
    this.app = app;
};

ChatService.prototype = new BaseService();

ChatService.prototype.getUserContactsList = function (contactList, user, callback) {
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

var removeExtraThingsInContactList = function (contactList, userPhoneNumber, next) {
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
        // Logger.info("splice", contactList.splice(position, 1));
    }

    // Logger.info("the processed contact list is",contactList);
    return next(null, contactList);
}

var makeFriendsviaPhoneBook = function (phoneBookObject, userPhoneNumber, callback) {

        var friendsList = [];
        var phonenumbers = phoneBookObject.phonebook_details.map(function(object){
          return object.phonenumber;
        })
        var users_map = {};

        domain.User.find({phonenumber:{$in:phonenumbers}},
          {phonenumber:1},
          function(err,users){
          async.forEach(users, function(user, pass){
            users_map[user._id] = user.phonenumber;
            friendsList.push(user._id);
            pass();
          },function(err){
            if(users.length>0){
              reverseSearchOfFriends(friendsList, phoneBookObject, users_map, callback);
            }else {
              callback(null,{})
            }
          })
        })
    }

    var reverseSearchOfFriends = function (friendsList, phoneBookObject, users_map, next) {
        // Logger.info("reverseSerachOfFriends called...", friendsList,users_map);
        var finalFriendList = [];
        async.forEach(friendsList, function (userid, passOn) {

          if (users_map[userid]) {
              domain.User_Phonebook_History.count({"user_id": phoneBookObject.user_id,"phonebook_details.phonenumber": users_map[userid]},
              function (error, phoneObject) {
                  if (phoneObject>0) {
                    // Logger.info("Adding inside the friends list",phoneBookObject.user_id,userid);
                      domain.User.findOneAndUpdate({_id: userid,deleted: false}, {
                          $addToSet: {
                              friends: phoneBookObject.user_id
                          }
                      }, function (errr, obj) {
                          // Logger.info("the adding res us",errr,obj);
                          finalFriendList.push(userid);
                          passOn();
                      });
                  } else {
                    passOn();
                      // Logger.info("Error occured in finding number in phonebook in reverseSerachOfFriends method ", error);
                      // callback(null, "error");
                  }
              });
          } else {
            passOn();
              // Logger.info("error in reverse serach of friends no userObject is found");
              // callback(null, "userObject is not found in reverse serach");
          }

        }, function (err, result) {
          // Logger.info("inside the ultimate function");
            // Logger.info("updating....user in reverseSerachOfFriendsss", finalFriendList);
            domain.User.findOneAndUpdate({_id: phoneBookObject.user_id}, {
                $addToSet: {
                    friends: {
                        $each: finalFriendList
                    }
                }
            }, function (err, usrObj) {
                if (usrObj) {
                  next(null,{});
                    // Logger.info("FriendList is added to " + phoneBookObject.user_id + " user upadted saved sucess");
                } else {
                  callback(null,{});
                    // Logger.info("Error occured in updating user..", err);
                }
            });
        });

    }

    ChatService.prototype.createChatChannel = function(user, friend_id, callback){
      var userid = user._id;
      var publish_topic = userid + "topic" +friend_id;
      var subscribe_topic = friend_id + "topic" + userid;
      async.auto({
        createChannelFromUserToFriend:function(next, result){
          createChannel(userid, friend_id, publish_topic, subscribe_topic, next);
        },
        createChannelFromFriendToUser:function(next, result){
          var friend_publish_topic = friend_id + "topic" + userid;
          var friend_subscribe_topic = userid + "topic" +friend_id;
          createChannel(friend_id, userid, friend_publish_topic, friend_subscribe_topic, next);
        }
      },function(err,results){
          var resObj = {};
          resObj.publish_topic = publish_topic;
          resObj.subscribe_topic = subscribe_topic;
          callback(null, SetResponse.setSuccess("The pub-sub topic has been generated successfully", resObj));
      })
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
            // Logger.info("Already Created");
            callback(null,from_user);
          }
        })

    }

ChatService.prototype.getInviteList = function(user, timestamp, callback){
  // Logger.info("the timestamp is",timestamp);
  var inviteList = [];
  var usersOnWeone = [];
  var flag = {};
  var phonebook;

  domain.User_Phonebook_History.findOne({user_id:user._id},function(err, phonebookRes){
      if(!err){
        if(phonebookRes){
          // Logger.info("lastSyncTimestamp lastSyncTimestamp",phonebookRes.lastSyncTimestamp);
          phonebookRes = JSON.parse(JSON.stringify(phonebookRes));
          phonebook = phonebookRes.phonebook_details;

          var phonebook_map = [];
          var new_phonebook = [];
          phonebook.forEach(function(contact){
            // Logger.info(mongoose.Types.ObjectId(contact._id).getTimestamp().getTime());
            if(mongoose.Types.ObjectId(contact._id).getTimestamp().getTime()>=timestamp){
              contact.phonenumber = parseInt(contact.phonenumber);
              phonebook_map.push(parseInt(contact.phonenumber));
              new_phonebook.push(contact)
            }
          })
          // Logger.info("the phonebook is",phonebook_map);

          domain.User.find({phonenumber:{$in:phonebook_map},deleted:false,role:'ROLE_USER'},
          {image_url:1,phonenumber:1},
          function(err, dbUsers){
            if(!err){
              if(dbUsers.length>0){
                // Logger.info("the res is",err, dbUsers);
                async.forEach(phonebook,function(contact, callback1){
                  async.forEach(dbUsers,function(dbContact, callback2){
                      if(contact.phonenumber === dbContact.phonenumber){
                      // Logger.info("hello1",contact.phonenumber,dbContact.phonenumber);
                      if(dbContact.image_url){
                        contact.image_url = dbContact.image_url;
                      }else {
                        contact.image_url = "null";
                      }
                      usersOnWeone.push(contact);
                      flag[contact.phonenumber] = 'PRESENT';
                      callback2();
                    }else {
                      callback2();
                    }
                  },function(err){
                    callback1();
                  })
                },function(err){
                  phonebook.forEach(function(contact){
                    if(!flag[contact.phonenumber]){
                      contact.image_url = "null";
                      inviteList.push(contact);
                    }
                  })
                  var resObj = {};
                  resObj.inviteList = inviteList;
                  resObj.usersOnWeone = usersOnWeone;
                  resObj.lastSyncTimestamp = new Date().getTime();
                  domain.User_Phonebook_History.update({user_id:user._id},
                    {$set:{lastSyncTimestamp:resObj.lastSyncTimestamp}},function(err,res){
                    callback(err, SetResponse.setSuccess("Success", resObj));
                  })
                })
              }else {
                phonebook.forEach(function(contact){
                  contact.image_url = "null";
                })
                var resObj = {};
                resObj.inviteList = new_phonebook;
                resObj.usersOnWeone = [];
                resObj.lastSyncTimestamp = new Date().getTime();
                domain.User_Phonebook_History.update({user_id:user._id},
                  {$set:{lastSyncTimestamp:resObj.lastSyncTimestamp}},function(err,res){
                  callback(err, SetResponse.setSuccess("Success", resObj));
                })
              }
            }else {
              callback(err,SetResponse.setSuccess("Some error has occurred !"));
            }
          })
        }else {
          var resObj = {};
          resObj.inviteList = [];
          resObj.usersOnWeone = [];
          resObj.lastSyncTimestamp = new Date().getTime();
          callback(err, SetResponse.setSuccess("No contacts found. Please upload the Contacts.",resObj));
        }
      }else {
        callback(err,SetResponse.setSuccess("Some error has occurred !"));
      }
  })
}

ChatService.prototype.updateContacts = function(user, contactList, callback){
  var addedContacts = contactList.add;
  var deletedContacts = contactList.delete;
  var updatedContactsOld = contactList.update.map(function(contact){return contact.old});
  var updatedContactsNew = contactList.update.map(function(contact){return contact.new});
  // Logger.info("the contacct list is",updatedContactsOld,updatedContactsNew);
  async.auto({
    removeExtraThingsInAddedContacts:function(next, result){
      if(addedContacts.length>0){
        removeExtraThingsInContactList(addedContacts, user.phonenumber, next)
      }else {
        next(null);
      }
    },
    removeExtraThingsInUpdatedContacts:function(next, result){
      if(updatedContactsOld.length>0){



        // removeExtraThingsInContactList(updatedContacts, user.phonenumber, next)
        async.auto({
          removeExtraThingsInUpdatedOldContacts:function(local_next,result){
            removeExtraThingsInContactList(updatedContactsOld, user.phonenumber, local_next)
          },
          removeExtraThingsInUpdatedNewContacts:function(local_next,result){
            removeExtraThingsInContactList(updatedContactsNew, user.phonenumber, local_next)
          }
        },function(err,results){
          var resObj = {};
          resObj.oldContacts = results.removeExtraThingsInUpdatedOldContacts;
          resObj.newContacts = results.removeExtraThingsInUpdatedNewContacts;
          next(null,resObj)
        })
      }else {
        next(null);
      }
    },
    removeExtraThingsInDeletedContacts:function(next, result){
      if(deletedContacts.length>0){
        removeExtraThingsInContactList(deletedContacts, user.phonenumber, next)
      }else {
        next(null);
      }
    },
    addContacts: ['removeExtraThingsInAddedContacts',function(next, result){
      if(addedContacts.length>0){
        // Logger.info("inside adding the contacts");
        var action = 'ADD';
        var contactList = result.removeExtraThingsInAddedContacts;
        // Logger.info("the contacct list is",contactList);
        updatingContacts(contactList, action, user, next);
      }else {
        next(null);
      }
    }],
    updateContacts: ['addContacts','removeExtraThingsInUpdatedContacts',function(next, result){
      if(updatedContactsOld.length>0){
        // Logger.info("results so far is",result.removeExtraThingsInUpdatedContacts);
        var action = 'UPDATE';
        var contactList = result.removeExtraThingsInUpdatedContacts;
        var updatedContactList = [];
        var counter = 0;
        async.forEach(contactList.oldContacts,function(contact,pass){
          var res = {};
          res.old = contact;
          res.new = contactList.newContacts[counter];
          updatedContactList.push(res);
          counter = counter+1;
          pass();
        },function(err){
          // Logger.info("the updated list is",updatedContactList);
          updatingContacts(updatedContactList, action, user, next);
        })
        // updatingContacts(contactList, action, user, next);
      }else {
        next(null);
      }
    }],
    deleteContacts: ['updateContacts','removeExtraThingsInDeletedContacts',function(next, result){
      if(deletedContacts.length>0){
        var action = 'DELETE';
        var contactList = result.removeExtraThingsInDeletedContacts;
        updatingContacts(contactList, action, user, next);
      }else {
        next(null);
      }
    }]
  },function(err,results){
      callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.userFriendsAdded, null));
  })
}

var updatingContacts = function(contacts, action, user, next){
  if(action=='ADD'){
    domain.User_Phonebook_History.count({user_id:mongoose.Types.ObjectId(user._id.toString())},
    function(error,count){
      if(count>0){
        domain.User_Phonebook_History.update(
          {user_id:mongoose.Types.ObjectId(user._id.toString())},
          {$addToSet:{phonebook_details:{$each:contacts}}},
            function(err, result){
              var resObj = {};
              resObj.phonebook_details = contacts;
              resObj.user_id = user._id;
              makeFriendsviaPhoneBook(resObj, user.phonenumber, next);
            })
      }else {
        var userId = user._id;
        var usrphonebookObject = new domain.User_Phonebook_History({user_id: userId,phonebook_details: contacts});
        usrphonebookObject.save(function (err, obj) {
            if (obj) {
                // Logger.info("Phonebook saved successfully...");
                makeFriendsviaPhoneBook(obj, user.phonenumber, next);
            } else {
              next(null);
            }
        });
      }
    })

  }else if(action=='UPDATE'){
    // Logger.info("updating the contacts");
    var new_contacts = contacts.map(function(contact){return contact.new});
    var new_numbers = new_contacts.map(function(contact){return contact.phonenumber});

    var old_contacts = contacts.map(function(contact){return contact.old});
    var old_numbers = old_contacts.map(function(contact){return contact.phonenumber});

    domain.User_Phonebook_History.update(
      {user_id:user._id},
      {$pull:{phonebook_details:{phonenumber:{$in:old_numbers}}}},function(err,res){
        domain.User_Phonebook_History.update(
          {user_id:user._id},
          {$pushAll:{phonebook_details:new_contacts}},function(err,res){
            var res = {};
            res.phonebook_details = new_contacts;
            res.user_id = user._id;
            makeFriendsviaPhoneBook(res, user.phonenumber, next);
            updateFriendList(user,contacts);
        })
    })
    // domain.User_Phonebook_History.findOne({user_id:user._id},{phonebook_details:0},function(err,result){
    //   // Logger.info("the res s",err,result.phonebook_details.length);
    //   // var original_contacts = result.phonebook_details;
    //
    //   // async.forEach(original_contacts,function(original_contact,pass1){
    //   //   async.forEach(contacts,function(contact,pass2){
    //   //     if(contact.old.phonenumber==original_contact.phonenumber){
    //   //       new_contacts.push(contact.new);
    //   //       pass2();
    //   //     }else {
    //   //       new_contacts.push(original_contact);
    //   //       pass2();
    //   //     }
    //   //   },function(err2){
    //   //     pass1();
    //   //   })
    //   // },function(err1){
    //   //   Logger.info("updating the phonebook",new_contacts);
    //   //
    //   // })
    // })
  }else if(action=='DELETE'){
    domain.User_Phonebook_History.find({user_id:user._id},function(err,result){
      var original_contacts = result.phonebook_details;
      var new_contacts = [];
      async.forEach(original_contacts,function(original_contact,pass1){
        async.forEach(contacts,function(contact,pass2){
          if(contact.phonenumber!=original_contact.phonenumber){
            new_contacts.push(original_contact)
            pass2();
          }else {
            pass2();
          }
        },function(err2){
          pass1();
        })
      },function(err1){
        domain.User_Phonebook_History.findOneAndUpdate(
          {user_id:user._id},
          {$set:{phonebook_details:new_contacts}},{new:true},function(err,res){
            // makeFriendsviaPhoneBook(res, user.phonenumber, next);
            next(null,{})
          })
      })
    })
  }
}

var updateFriendList = function(userObj,contacts){
  // Logger.info("inside updating the frienlist",userObj.friends);
  var oldContacts = contacts.map(function(contact){return contact.old});
  var newContacts = contacts.map(function(contact){return contact.new});
  // Logger.info("the contacts are",oldContacts,newContacts);

  domain.User.distinct('_id',{phonenumber:{$in:newContacts.map(function(contact){return contact.phonenumber})}},function(err,friends){
    // Logger.info("the friends are",friends);
    domain.User.update({_id:userObj._id},{$set:{friends:friends}},function(err,updatedObj){
      // Logger.info("updated",err,updatedObj);
    })
    domain.User.update({phonenumber:{$in:oldContacts.map(function(contact){return contact.phonenumber})}},{$pull:{friends:userObj._id}},{multi:true},function(err,updatedObj){
      // Logger.info("updated",err,updatedObj);
    })

  })
}

module.exports = function (app) {
    return new ChatService(app);
};
