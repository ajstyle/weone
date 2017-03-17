var BaseService = require('./BaseService');
var shortid = require('shortid');
UserDataService = function (app) {
    this.app = app;
};
var neo4jDb = new neo4j(configurationHolder.config.neo4jUrl);
UserDataService.prototype = new BaseService();

/*
It will provide the network status of MLM upto 10 levels.It will information of bottom of tree user ie name of user,balance in his
account. and This information commes from jobs and store history in document(User_Network_details)
*/

UserDataService.prototype.setPaymentRequest = function(user, callback){
  domain.UserRequests.count({user:user._id,status:"PENDING",request_type:"PAYMENT"},function(err, count){
    if(count>0){
      callback(err, SetResponse.setSuccess("Your previous request for the Payment is already in the process.", {isRequestAccepted:false}));
    }else {
      var requestObj = {};
      requestObj.user = user._id;
      requestObj.request_type = 'PAYMENT';
      requestObj.status = 'PENDING';
      var saveRequest = new domain.UserRequests(requestObj);
      saveRequest.save(function(err,res){
        if(!err){
          callback(err, SetResponse.setSuccess("Your Request has been accepted", {isRequestAccepted:true}));
        }else {
          callback(err, SetResponse.setSuccess("Due to some error your request can't be accepted right now.", {isRequestAccepted:false}));
        }
      });
    }
  })
}

UserDataService.prototype.getInviteList = function(user, callback){
  var inviteList = [];
  var usersOnWeone = [];
  var flag = {};
  var phonebook;

  domain.User_Phonebook_History.findOne({user_id:user._id},function(err, phonebookRes){
      if(!err){
        if(phonebookRes){
          phonebookRes = JSON.parse(JSON.stringify(phonebookRes));
          phonebook = phonebookRes.phonebook_details;
          var phonebook_map = phonebook.map(function(contact){
            contact.phonenumber = parseInt(contact.phonenumber);
            return contact.phonenumber;
          })
          phonebook.forEach(function(contact){
            contact.phonenumber = parseInt(contact.phonenumber);
          })

          domain.User.find({phonenumber:{$in:phonebook_map}},{phonenumber:1,image_url:1,name:1},function(err, dbUsers){
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
                  callback(err, SetResponse.setSuccess("Success", resObj));
                })
              }else {
                phonebook.forEach(function(contact){
                  contact.image_url = "null";
                })
                var resObj = {};
                resObj.inviteList = phonebook;
                resObj.usersOnWeone = [];
                callback(err, SetResponse.setSuccess("Success",resObj ));
              }
            }else {
              callback(err,SetResponse.setSuccess("Some error has occurred !"));
            }
          })
        }else {
          var resObj = {};
          resObj.inviteList = [];
          resObj.usersOnWeone = [];
          callback(err, SetResponse.setSuccess("No contacts found. Please upload the Contacts.",resObj));
        }
      }else {
        callback(err,SetResponse.setSuccess("Some error has occurred !"));
      }
  })

}

UserDataService.prototype.getUserRequests = function(type,limit,skip, callback){
  // Logger.info("the type is",type);
  domain.UserRequests.find({request_type:type}).skip(skip).limit(limit).populate('user').exec(function(err, requests){
    if(!err){
      var resData = {};
      resData.paymentRequests = requests;
      if(skip!=0){
      callback(err, SetResponse.setSuccess("Success",resData));
    }else{
    //  Logger.info("hello1");
      domain.UserRequests.find({request_type:type}).count(function(err,count){
        resData.count=count;
        callback(err, SetResponse.setSuccess("Success",resData));

      })

    }
    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })
}

UserDataService.prototype.setUserRequest = function(user, callback){
  // Logger.info("the user is",user);
  domain.UserRequests.update({user:user._id,request_type:user.type},{$set:{status:user.newStatus}},
  function(err, result){
    if(!err){
      callback(err, SetResponse.setSuccess("Successfully Updated the Request Status"));
    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })
}

UserDataService.prototype.addInviters = function(callback){
  var default_inviter_id = mongoose.Types.ObjectId("5741575d4d4351de7c9eca4e")
  domain.User.find({deleted:false,role:'ROLE_USER',inviter:null,_id:{$ne:default_inviter_id}},{phonenumber:1},function(err, users){
    if(!err){
      usersArr = users//[users[0]];
      usersArr.forEach(function(user){
        domain.User.find({user_invite_people:user.phonenumber},{_id:1}).sort({createdAt:1}).exec(function(error,inviter){
          if(inviter.length>0){
          // if(-1>0){
            domain.User.update({_id:user._id},{inviter:inviter[0]._id},function(updateErr,updateRes){
              if(!updateErr){
                // Logger.info("Updated inviter Successfully");
              }else {
                // Logger.info("Cant update the inviter");
              }
            })
          }else {
            // Logger.info("Cant update the inviter, no inviter present adding under Root");
            domain.User.update({_id:user._id},{inviter:default_inviter_id},function(updateErr,updateRes){
              if(!updateErr){
                // Logger.info("Updated inviter Successfully");
              }else {
                // Logger.info("Cant update the inviter");
              }
            })
          }
        })
      })
      var resData = {};
      resData.users = users;
      resData.length = users.length;
      callback(err, SetResponse.setSuccess("Inviter is added",users.length));
    }else {
      callback(err, SetResponse.setSuccess(""));
    }
  })
}
UserDataService.prototype.developMLMTree = function(callback){
  developMLMv2();
  callback(null, SetResponse.setSuccess("Inserted"));
}

UserDataService.prototype.modifyTreeStructure = function(callback){
  //for PRODUCTION
  domain.MLMv2.find({node_id:187},function(err, rootNode){
    if(rootNode.length<1){
      var mlmobj = new domain.MLMv2({
          node_id: 187,
          parent_node: 0,
          user_details: mongoose.Types.ObjectId("5741575d4d4351de7c9eca4e")
      });
      mlmobj.save(function (err, obj) {
          // Logger.info("object is saved successfully");
      });
    }
  })

  neo4jDb.cypherQuery("MATCH (s:user) WHERE NOT (s)<-[:Relationship]-(:user) RETURN s",function(err, result){
    if(!err){
      //Logger.info("the resp is",err,result.data.length,result.data[0]);
      var orphUsers = [];
      for(var i=1;i<1000;i++){
        if(result.data[i]){
          orphUsers.push(result.data[i])
        }
      }
      async.forEach(orphUsers,function(invited, next){
        // Logger.info("the invitee is",invited);
        if(invited._id!=187){
        //if(invited._id!=334){
          domain.User.findOne({_id:invited.objectId}).populate('inviter').exec(function(err,res){
            // Logger.info("the sss",err,res.neo4J_node_id);
            if(res){
              if(invited._id!=res.neo4J_node_id){
                neo4jDb.cypherQuery("MATCH(n) where id(n)="+invited._id+" DETACH DELETE (n)",function(err, response){
                  // Logger.info("deleted ",err,response);
                  next();
                })
              }else {
                async.auto({
                  getInviterId:function(next1, result){
                    if(res.inviter){
                      if(res.inviter.deleted){
                        inviter_id = 187; //for PRODUCTION
                        // inviter_id = 273;
                        inviter_ph = 919930365052;
                        next1(null);
                      }else {
                        inviter_id = res.inviter.neo4J_node_id;
                        inviter_ph = res.inviter.phonenumber;
                        next1(null);
                      }
                    }else {
                      inviter_id = 187; //for PRODUCTION
                      // inviter_id = 273;
                      inviter_ph = 919930365052;
                      next1(null);
                    }
                  },
                  createRelationships:['getInviterId',function(next1, result){
                    // Logger.info("the inviter iid is",inviter_id);
                    if(inviter_id==''){
                      inviter_id = 187; //for PRODUCTION
                      // inviter_id = 273;

                    }
                    neo4jDb.insertRelationship(inviter_id, res.neo4J_node_id, 'Relationship',{},
                      function(err, relationship){
                        if(err) throw err;
                        // Logger.info("the created relation is",err,relationship);
                        var mlmobj = new domain.MLMv2({
                            node_id: relationship._end,
                            parent_node: relationship._start,
                            user_details: res._id
                        });
                        mlmobj.save(function (err, obj) {
                            // Logger.info("object is saved successfully",err,obj);
                            next1(null);
                        });

                    });
                  }]
                },function(err, results){
                  next();
                })
              }
            }else {
              next();
            }
          })
        }
      },function(err){
        callback(null, SetResponse.setSuccess("Inserted"));
      })
    }
  })
}

var developTree = function(root, superCallback){
  domain.User.find({inviter:root._id,neo4J_node_id:{$ne:""},deleted:false,role:"ROLE_USER"},function(err,invited_users){
        async.auto({
      createTheRelationship:function(next, result){
        if(invited_users.length>0){
          return createRelationships(root, invited_users, next)
        }else {
          next(null)
        }
      },
      recursiveCall:['createTheRelationship',function(next, result){
        async.forEach(invited_users,function(user, callback){
          developTree(user,callback);
        },function(err){
          next(null);
          // superCallback(false,"");
        })
      }]
    },function(err,results){
      superCallback(false,"");
    })
  })
}

var createRelationships = function(root, invited_users, superCallback){
  // Logger.info("Inserting...",root.neo4J_node_id);
  var invitees = invited_users;
  async.forEach(invitees,function(child,callback){
    neo4jDb.insertRelationship(root.neo4J_node_id, child.neo4J_node_id, 'Relationship',{},
      function(err, relationship){
        if(err) throw err;
        // Logger.info("the created relation is",err,relationship._start,relationship._end);
        callback();
      });
  },function(err){
    superCallback(null);
  })
}

var deleteDuplicateNodes = function(){

}

var developMLMv2 = function(){
// Logger.info("11111111111111111");
  domain.User.find({deleted:false,role:'ROLE_USER'},{_id:1,neo4J_node_id:1},function(err, users){
    // Logger.info("helllo",users.length);
    users.forEach(function(user){
      // Logger.info("the id is",user.neo4J_node_id);
      user = JSON.parse(JSON.stringify(user));
      user.neo4J_node_id = parseInt(user.neo4J_node_id);
      domain.MLMv2.find({parent_node:user.neo4J_node_id},function(err,child_nodes){

        async.auto({
          getChildNodes:function(next,res){
            if(child_nodes.length>0){
              var childMap = [];
              async.forEach(child_nodes, function(child, localNext){
                childMap.push(child.node_id);
                localNext();
              },function(err){
                // Logger.info("the child map is",childMap);
                next(null,childMap)
              })
            }else {
              next(null)
            }
          },
          updateTheNode:['getChildNodes',function(next, res){
            // Logger.info("the res is",res);
            if(res.getChildNodes){
              domain.MLMv2.update({node_id:user.neo4J_node_id},{$set:{child_nodes:res.getChildNodes}},
                function(err,updateRes){
                // Logger.info("Updated the children");
                next(null);
              })
            }else {
              next(null);
            }
          }]
        },function(err, response){
          var i=0;
          Logger.info(++i);
        })

        // if(child_nodes.length>0){
        //   var childMap = child_nodes.map(function(child){
        //     return child.node_id
        //   });
        //   domain.MLMv2.update({node_id:user.neo4J_node_id},{$set:{child_nodes:childMap}},
        //     function(err,updateRes){
        //     Logger.info("Updated the children");
        //   })
        // }
      })
      // domain.MLMv2.update({parent_node:user.neo4J_node_id},{$push:{child_nodes:}})
    })
  })
}

UserDataService.prototype.removeCycleFromTree = function(callback){
// ,phonenumber:{$in:['917666092889','919953938981','919899584411','919971799473']}
  domain.User.find({deleted:false,role:'ROLE_USER'},{_id:1,inviter:1},function(err,users){
    // Logger.info("the results is",users.length);
    var map = {};
    users.forEach(function(user){
      map[user._id] = user.inviter;
    })
    // Logger.info("thththth",map);
    var path_map = {};
    async.forEach(users,function(user, next){
      // Logger.info("counter",user.inviter);
      async.auto({
          getPath:function(localNext,result){
            return findNodePath(user._id,user._id,map,path_map,0,localNext);
          }
        },
        function(err, results){
          // Logger.info("the path is",results.getPath);
          // removeCycleRecursive(results.getPath.firsUser,results.getPath.path_map,{});
          next();
      })

    },function(err){
      callback(null, SetResponse.setSuccess("Successfully Updated the Tree"));
    })
  })
}

var findNodePath = function(user_id, const_id, map, path_map,counter,next){
  if(map[user_id] && counter<100){
    // Logger.info("counter ",counter);
    // if(counter==0){
      path_map[user_id] = map[user_id];
      counter++;
      findNodePath(map[user_id], const_id, map,path_map,counter,next);

    // }else {
    //   if(user_id!=const_id){
    //     path_map[user_id] = map[user_id];
    //     counter++;
    //     findNodePath(map[user_id], const_id, map,path_map,counter,next);
    //   }else {
    //     var response = {};
    //     response.path_map = path_map;
    //     response.firsUser = user_id;
    //     next(null,response);
    //   }
    // }
  }else {
    if(counter == 100){
      // Logger.info("there is a cycle");
      updateTheRelationship(user_id,path_map[user_id]);
      var response = {};
      response.path_map = path_map;
      response.firsUser = user_id;
      next(null,response);
    }else {
      // Logger.info("there is NO cycle");
      var response = {};
      response.path_map = path_map;
      response.firsUser = user_id;
      next(null,response);
    }

  }
}

var removeCycleRecursive = function(user, path_map, arr_map){
  if(!arr_map[user]){
    arr_map[user] = 1;
    if(path_map[user]){
      removeCycleRecursive(path_map[user],arr_map)
    }
  }else {
    updateTheRelationship(user,path_map[user]);
  }
}

var updateTheRelationship = function(user, inviter){
// Logger.info("the 1st query is"+"START n=node(*) MATCH n-[rel:Relationship]->r WHERE n.objectId='"+inviter+"' AND r.objectId='"+user+"' DELETE rel");
// Logger.info("the 2nd query is"+"MATCH (u:user {objectId:'5741575d4d4351de7c9eca4e'), (r:user {objectId:'"+user+"') CREATE (u)-[:Relationship]->(r)");

  neo4jDbConnection.cypherQuery("START n=node(*) MATCH (n)-[rel:Relationship]->(r) WHERE n.objectId='"+inviter+"' AND r.objectId='"+user+"' DELETE rel",
  function(err,res){
    // Logger.info("the 1st res is",err,res);
      neo4jDbConnection.cypherQuery("MATCH (u:user {objectId:'5741575d4d4351de7c9eca4e'}), (r:user {objectId:'"+user+"'}) CREATE (u)-[:Relationship]->(r)",
      function(err,res2){
        // Logger.info("the 2nd res is",err,res2);
        // Logger.info("Relationship has been updated");
        domain.User.update({_id:user},{$set:{inviter:mongoose.Types.ObjectId('5741575d4d4351de7c9eca4e')}},
        function(err,response){
          // Logger.info("updated in mongoose");
        })
      })
  })
}
UserDataService.prototype.getNetworkTree = function(user, callback){
  domain.User_Network_Tree.findOne({user_id:mongoose.Types.ObjectId(user._id)},{child_levels_count:1},function(err,result){
	console.log("the response is",err,result,user._id);
   if(result){
      result = JSON.parse(JSON.stringify(result));
      var resObj = {};
      var zerothObj = {};

      zerothObj.level_name = 'Level 0';
      zerothObj.person_count = 1;
      zerothObj._id = 'null';
      zerothObj.children_count = 1;
      zerothObj.totalbalance = user.user_account.wallet.wallet_amount_available;

      result.child_levels_count.unshift(zerothObj);
      async.forEach(result.child_levels_count,function(level,pass){
        level.person_count = level.children_count;
        level.totalbalance = 0;
        delete level['children_count'];
        delete level['_id'];
        pass();
      },function(err){
        resObj._id = result._id;
        resObj.user_id = user._id;
        resObj.levels = result.child_levels_count;
        resObj.number_of_levels = result.child_levels_count.length-1;
        if(resObj.levels!= null &&  parseInt(resObj.number_of_levels)>0){
          domain.MLMv3.findOne({user_id:user._id},{child_count:1,child_ids:1},function(err,levelCount){
            domain.User.count({deleted:false,_id:{$in:levelCount.child_ids}},function(error,resCount){
              resObj.levels[1].person_count = resCount//levelCount.child_count;
              return callback(null, SetResponse.setSuccess("Your network tree is ",resObj));
            })
          })
        }else{
          return callback(null, SetResponse.setSuccess("Please invite atleast two people to connect to the network",resObj));
        }
      })

    }else {
      return callback(null, SetResponse.setSuccess("Welcome to WeOne. Your tree is Empty. Please Invite at least two friends to join your tree",{}));
    }
  })
}

var getChildNodesByNeoId = function(neo_ids,level_array,counter, callback){
  domain.MLMv2.find({node_id:{$in:neo_ids}},function(err,result){
    if(result.length>0 && counter<11){
      var userIds = result.map(function(user){
            return user.user_details;
      })
      domain.User.find({_id:{$in:userIds}},{name:1,phonenumber:1,'user_account.wallet.wallet_amount_available':1},
      function(err, users){
        // Logger.info("Level ",counter,result.length);
        var resObj = {};
        var total_amount = 0;
        var persons = [];
        async.forEach(users, function(user, pass){
          var obj = {};
          obj.name = user.name;
          obj.phonenumber = user.phonenumber;
          obj.total_balance = user.user_account.wallet.wallet_amount_available.toFixed();
          obj.user_id = user._id;
          persons.push(obj);
          pass();
        },function(err){
          resObj.level_name = 'Level '+counter;
          resObj.persons = persons;//{name:users.name,phonenumber:users.phonenumber,total_balance:total_amount};
          resObj.person_count = result.length;
          level_array.push(resObj);

          var next_level_nodes = [];
          async.forEach(result, function(node,next){
            node.child_nodes.forEach(function(child){
              next_level_nodes.push(child)
            });
            next();
          },function(err){
            counter++;
            getChildNodesByNeoId(next_level_nodes, level_array, counter, callback)
          })
        })
      })
    }else {
      callback(null,level_array);
    }

  })
}

UserDataService.prototype.scriptGenerateNetworkTree = function(neoId, callback){
  // Logger.info("teh jjhs",user.neo4J_node_id);
  domain.User.find({neo4J_node_id:neoId.toString()},{neo4J_node_id:1, _id:1 },function(err, users){
    // Logger.info("the users count is",users.length);
    async.forEach(users, function(user,localNext){
      var neo_id = parseInt(user.neo4J_node_id);
      var level_array = [];
      var counter = 0;
      async.auto({
        getNetworkTree:function(next,result){
          return getChildNodesByNeoId([neo_id],level_array,counter, next);
        }
      },function(err, result){
        // Logger.info("the res is",err,result);
        var resObj = {};
        resObj.number_of_levels = result.getNetworkTree.length - 1;
        resObj.levels = result.getNetworkTree
        resObj.user_id = user._id;
        resObj.node_id = neo_id;
        var saveNetworkDetails = new domain.User_Network_Detailsv2(resObj);
        saveNetworkDetails.save(function(err,savedObj){
          // Logger.info("the error is",err);
          localNext();
        })
        //callback(null, SetResponse.setSuccess("Your Tree is",resObj));
      })
    },function(err){
        callback(null, SetResponse.setSuccess("script completed Successfully"));
    })
  })
}

UserDataService.prototype.getReceiptFillingDetails = function(user, callback){
  var voucher_id = shortid.generate();
  var userId = user._id;
  domain.User_Account_Details.findOne({user:userId},{city:1,pin_code:1},function(err, accountObj){
    // Logger.info("the account details are",accountObj,err);
    if(!err && accountObj){
    	domain.Voucher.find({user_id:userId,amount:{$gt:0}}).sort({created:-1}).exec(function(err,voucher){
        if(voucher[0]){
          // Logger.info("Fetching from created",voucher[0],typeof voucher[0].created);

	        voucher = voucher[0];
          var voucherObj = {};
          voucherObj.voucherId = voucher_id;
          voucherObj.startDate = new Date(voucher.endDate.getTime()+1*24*60*60000);
          voucherObj.user_id = userId;
          var voucher = new domain.Voucher(voucherObj);
          voucher.save(function(err,resObj){
            // Logger.info("the res us",err,resObj);
            if(!err){
              var response = {};
              response.voucherId = voucher_id;
              response.startDate = resObj.startDate
              response.status = resObj.status;
              response.created = resObj.created;

              if(accountObj.city && accountObj.pin_code){
                response.city = accountObj.city;
         	      response.pin = accountObj.pin_code;
      	      }else{
              	response.city = 'NA';
         		    response.pin = 0;
      	      }
              callback(null, SetResponse.setSuccess("The receipt details is",response));
            }else {
              // Logger.info("1");
              callback(null, SetResponse.setSuccess("Some Error",{}));
            }
          })
        }else {
          // Logger.info("Creating new voucher first time");
          var voucherObj = {};
          voucherObj.voucherId = voucher_id;
          voucherObj.startDate = new Date(user.created).setHours(05,30,0,0);
          voucherObj.user_id = userId;
          var voucher = new domain.Voucher(voucherObj);
          voucher.save(function(err,resObj){
            // Logger.info("the res us",err,resObj);
            if(!err){
              var response = {};
              response.voucherId = voucher_id;
              response.startDate = resObj.startDate
              response.status = resObj.status;
              response.created = resObj.created;

		          if(accountObj.city && accountObj.pin_code){
                response.city = accountObj.city;
                response.pin = accountObj.pin_code;
              }else{
                response.city ='NA'
                response.pin =0
              }
              callback(null, SetResponse.setSuccess("The receipt details is",response));
            }else {
              // Logger.info("1");
              callback(null, SetResponse.setSuccess("Some Error",{}));
            }
          })
        }
      })
    }else {
      // Logger.info("2");
      callback(null, SetResponse.setSuccess("Please enter your Account Information",{}));
    }
  })
}

UserDataService.prototype.generateReceipt = function(user, data, callback){
  var endDate = new Date(data.endDate);
  var todaydate = new Date();
  var voucherId = data.voucherId;
  var city = data.city;
  var pin = data.pin;
  var amount = data.amount;
  var registration_no = data.stRegNo;
  var status = 'PENDING';

  var date_difference = (todaydate.setHours(0,0,0,0)-endDate.setHours(0,0,0,0))/(1000*60*60*24);
  // Logger.info("the date diff is",date_difference);
  if(date_difference>=7 && amount>20){
    if(date_difference>7){
      status = 'PENDING';
    }
    domain.Voucher.update({voucherId:voucherId},{$set:{endDate:endDate,amount:amount,status:status}},function(err,resObj){
      if(!err && resObj.n!=0){
        // Logger.info("the response is",res);
        var voucherObj = {};
        voucherObj.startDate = new Date(endDate.setDate(endDate.getDate() + 1)).setHours(05,30,0,0);
        voucherObj.voucherId = shortid.generate();
        voucherObj.city = city;
        voucherObj.pin = pin;
        voucherObj.user_id = user._id;
        voucherObj.stRegNo = registration_no;
        var voucher = new domain.Voucher(voucherObj);
        voucher.save(function(err,voucherSavedObj){
          // Logger.info("the res is",err,voucherSavedObj);
          if(!err){
            callback(null, SetResponse.setSuccess("Your Voucher generated Successfully",{}));
          }else {
            // Logger.info("1");
            callback(null, SetResponse.setSuccess("Some Error",{}));
          }
        })
      }else {
        // Logger.info("2");
        callback(null, SetResponse.setSuccess("Some Error",{}));
      }
    })
  }else {
    callback(null, SetResponse.setSuccess("You can generate receipt with end date dated 7 days before today and amount greater than 20.",{}));
  }
  // endDate = endDate.setHours(05,30,0,0);


}
UserDataService.prototype.getTreeLevel = function(user, level, skip, limit, callback){
  var level_name = 'Level '+level;
  skip = parseInt(skip);
  limit = parseInt(limit);

  domain.MLMv3.findOne({user_id:user._id},function(err, mlmObj){
   var child_ids = mlmObj.child_ids;

    if(child_ids.length>0){
      domain.User.find({_id:{$in:child_ids},deleted:false},
        {name:1,phonenumber:1,created:1}).skip(skip).limit(limit).sort({_id:-1}).exec(function(err,users){
//	Logger.info("the users are",err,users)
 	  users = JSON.parse(JSON.stringify(users))
          var result = [];
          async.forEach(users,function(user,pass){
            var resObj = {};
            resObj.name = user.name;
            resObj.phonenumber = user.phonenumber;
            resObj.joining_date = user.created;
            resObj.total_balance = 0;
            resObj.user_id = user._id;
            result.push(resObj);
            pass();
          },function(err){
            var response = {};
            response.persons  = result;
            callback(null, SetResponse.setSuccess("The paginated response is",response));
          })
      })
    }else {
      callback(null, SetResponse.setSuccess("NO CHILDREN"));
    }
  })
}

// UserDataService.prototype.getTreeLevel = function(node_id, level, skip, limit, callback){
//   var levelName = 'Level '+level;
//   node_id = parseInt(node_id.neo4J_node_id);
//   domain.User_Network_Detailsv2.findOne({node_id:node_id},{levels:{$elemMatch:{level_name:levelName}}},function(err, userNet){
//     // Logger.info("The res is",err,userNet);
//     if(!err && userNet){
//       var persons = userNet.levels[0].persons;
//       var resObj = [];
//       var counter = parseInt(skip);
//       if(limit!=0){
//         var counter_upper_limit = counter + parseInt(limit) - 1;
//       }else {
//         var counter_upper_limit = userNet.levels[0].persons.length;
//       }
//       Logger.info("SKIP:",counter,"UPPER_LIMIT:",counter_upper_limit);
//       getPaginatedData(counter, persons, resObj, counter_upper_limit, callback);
//     }else {
//       callback(null, SetResponse.setSuccess("Some Error"));
//     }
//   })
// }

UserDataService.prototype.getTreeLevelAdmin = function( level,userId, skip, limit, callback){
  var level_name = 'Level '+level;
  domain.MLMv3.findOne({user_id:userId},function(err, mlmObj){
    var child_ids = mlmObj.child_ids;
    if(child_ids.length>0){
      domain.User.find({_id:{$in:child_ids},deleted:false},
        {name:1,phonenumber:1,created:1}).skip(skip).limit(limit).sort({_id:-1}).exec(function(err,users){
          users = JSON.parse(JSON.stringify(users))
          var result = [];
          async.forEach(users,function(user,pass){
            var resObj = {};
            resObj.name = user.name;
            resObj.phonenumber = user.phonenumber;
            resObj.joining_date = user.created;
            resObj.total_balance = 0;
            resObj.user_id = user._id;
            result.push(resObj);
            pass();
          },function(err){
            var response = {};
            response.persons  = result;
            callback(null, SetResponse.setSuccess("The paginated response is",response));
          })
      })
    }else {
      callback(null, SetResponse.setSuccess("NO CHILDREN"));
    }
  })
}

// UserDataService.prototype.getTreeLevelAdmin = function( level,userId, skip, limit, callback){
//   var levelName = 'Level '+level;
//
//   domain.User_Network_Detailsv2.findOne({user_id:userId},{levels:{$elemMatch:{level_name:levelName}}}).lean().exec(function(err, userNet){
//     //  Logger.info("The res is",userNet.levels[0].persons.length);
//     var count=userNet.levels[0].persons.length;
//     if(!err && userNet){
//       var persons = userNet.levels[0].persons;
//       var resObj = [];
//       var counter = parseInt(skip);
//       if(limit!=0){
//         var counter_upper_limit = counter + parseInt(limit);
//       }else {
//         var counter_upper_limit = userNet.levels[0].persons.length;
//       }
//       Logger.info("SKIP:",counter,"UPPER_LIMIT:",counter_upper_limit);
//       getPaginatedDataAdmin(counter,count, persons, resObj, counter_upper_limit, callback);
//     }else {
//       callback(null, SetResponse.setSuccess("Some Error"));
//     }
//   })
//
// }

var getPaginatedData = function(counter, persons, resObj, limit, callback){

  if(limit>=counter){
    // Logger.info("the data in recursion is",counter, persons, resObj, limit);
    if(persons[limit]){
      resObj.push(persons[limit]);
    }
    limit--;
    getPaginatedData(counter, persons, resObj, limit, callback);
  }
  // if(counter<limit){
  //   // Logger.info("the data in recursion is",counter, persons, resObj, limit);
  //   if(persons[counter]){
  //     resObj.push(persons[counter]);
  //   }
  //   counter++;
  //   getPaginatedData(counter, persons, resObj, limit, callback);
  // }
  else {
    var result = {};
    result.persons = resObj;

    var user_ids = resObj.map(function(user){
      return user.user_id;
    })
    domain.User.find({_id:{$in:user_ids}},{_id:1,created:1}).lean().exec(function(err,users){
      var userid_joining_map = {};
      async.forEach(users,function(user,pass){
        userid_joining_map[user._id] = user.created;
        pass();
      },function(err){
        resObj = JSON.parse(JSON.stringify(resObj))
          async.forEach(resObj,function(person,pass2){
            person.joining_date = userid_joining_map[person.user_id];
            pass2();
          },function(err){
              result.persons = resObj;
              callback(null, SetResponse.setSuccess("The paginated response is",result));
          })
      })
    })
  }
}
var getPaginatedDataAdmin = function(counter,count, persons, resObj, limit, callback){
  if(counter<limit){
    // Logger.info("the data in recursion is",counter, persons, resObj, limit);
    if(persons[counter]){
      resObj.push(persons[counter]);
    }
    counter++;

    getPaginatedDataAdmin(counter,count, persons, resObj, limit, callback);
  }else {
    var result = {};
    result.persons = resObj;
    result.count=count;
    callback(null, SetResponse.setSuccess("The paginated response is",result));
  }
}

UserDataService.prototype.getVoucherDetails = function (skip,limit,callback) {
  var results={};

domain.Voucher.count({endDate:{$ne:null},amount:{$gt:0}},function(err,count){
  if(count>0){
    domain.Voucher.find({endDate:{$ne:null},amount:{$gt:0}})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort('-created')
      .populate('user_id')
      .exec(function(err,voucher){
        if(!err && voucher){

        results.object=voucher;
        results.count=count;
callback(err, SetResponse.setSuccess("user with its voucher detail",results));
}
else{

  callback(err, SetResponse.setSuccess("No voucher exist",null));
}
  })
}
else {
  callback(err, SetResponse.setSuccess("No voucher exist",null));

}

  })
}
UserDataService.prototype.voucherWithUserId = function (userId,skip,limit,callback) {
   //Logger.info("userId is ",userId);
   var results={};
  // var id= mongoose.Types.ObjectId(userId);
  //    Logger.info("id is ",id);
  skip = parseInt(skip);
  limit = parseInt(limit);
     domain.Voucher.count({"user_id":userId,endDate:{$ne:null},amount:{$gt:0}},function(err,count){
       if(!err && count>0){
  domain.Voucher.find({"user_id":userId,endDate:{$ne:null},amount:{$gt:0}})
  .skip(skip)
  .limit(limit)
  .populate('user_id')
  .exec(function(err,voucher){

    if(!err && voucher){
      results.object=voucher;
      results.count=count;
      callback(err, SetResponse.setSuccess("voucher  detail of user is",results));
    }else {

      callback(err, SetResponse.setSuccess("NO voucher exists",null));
    }
  })
}else {
    callback(err, SetResponse.setSuccess("NO voucher exists",null));
}
  })
}

UserDataService.prototype.viewVoucherOfUser = function (voucherId,callback) {
  // Logger.info("id is ",voucherId);
  domain.Voucher.findOne({"voucherId":voucherId})
  .populate('user_id')
  .exec(function(err,user){
  //  Logger.info("user is",user);
    if(!err && user){
      callback(err, SetResponse.setSuccess("user with its voucher detail",user));
    }else {
      callback(err, SetResponse.setSuccess("Please fill your Account Information",null));
    }
  })
}



UserDataService.prototype.getVoucherDetails = function (skip,limit,callback) {
  var results={};
domain.Voucher.count({endDate:{$ne:null},amount:{$gt:0}},function(err,count){
  if(count>0){
    domain.Voucher.find({endDate:{$ne:null},amount:{$gt:0}})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort('-created')
      .populate('user_id')
      .exec(function(err,voucher){
        if(!err && voucher){

        results.object=voucher;
        results.count=count;
callback(err, SetResponse.setSuccess("user with its voucher detail",results));
}
else{

  callback(err, SetResponse.setSuccess("No voucher exist",null));
}
  })
}
else {
  callback(err, SetResponse.setSuccess("No voucher exist",null));

}

  })
}
UserDataService.prototype.voucherWithUserId = function (userId,skip,limit,callback) {
   var results={};
     domain.Voucher.count({user_id:userId,endDate:{$ne:null},amount:{$gt:0}},function(err,count){
       if(!err && count>0){
  domain.Voucher.find({user_id:userId,endDate:{$ne:null},amount:{$gt:0}})
  .skip(skip)
  .limit(limit)
  .sort('-created')
  .populate('user_id',"name phonenumber")
  .exec(function(err,voucher){

    if(!err && voucher){
      results.object=voucher;
      results.count=count;
      callback(err, SetResponse.setSuccess("voucher  detail of user is",results));
    }else {

      callback(err, SetResponse.setSuccess("NO voucher exists",null));
    }
  })
}else {
    callback(err, SetResponse.setSuccess("NO voucher exists",null));
}
  })
}

UserDataService.prototype.viewVoucherOfUser = function (voucherId,callback) {
  // Logger.info("id is ",voucherId);
  domain.Voucher.findOne({"voucherId":voucherId})
  .populate('user_id')
  .exec(function(err,user){
  //  Logger.info("user is",user);
    if(!err && user){
      callback(err, SetResponse.setSuccess("user with its voucher detail",user));
    }else {
      callback(err, SetResponse.setSuccess("Please fill your Account Information",null));
    }
  })
}
UserDataService.prototype.getUserEarningDetailsById=function(userId,callback){
  //  Logger.info("earning of id ",userId);
  var userEarningResult={};
  domain.User_Earning_Bucket.find({user_id:userId}).populate('user_id',"user_account").exec(function(err,earning){
    userEarningResult.object=earning;
    // Logger.info("userEarning details >>>>>>",userEarningResult.object);
    if(!err){
      domain.User_Earning_Bucket.find({user_id:userId}).count(function(err,rescount){
       if(!err){
         userEarningResult.count=rescount;
        //  Logger.info(" count value is >",rescount);
         callback(err,SetResponse.setSuccess("user with its earning ",userEarningResult));
       }
     })
   }

  })

}
UserDataService.prototype.getUserEarningDetailsByIdAndDate=function(userId,date,callback){
  // Logger.info("earning of id ",userId);
  var userEarningResult={};
  var date = new Date(date);
    // var isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
    // Logger.info("date after new Date is ",date,isoDate);

    var date1 = new Date(date);
    var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
    // var isoDate1 = new Date(oneDayAfter.getTime() - oneDayAfter.getTimezoneOffset() * 60000).toISOString();
  // Logger.info("date after new Date is ",date,isoDate1);
    domain.User_Earning_Bucket.find({$and: [

                                {user_id:userId },
                                {date_of_earning: {$gte:date,$lte:oneDayAfter}}
                            ]}).populate('user_id').exec(function(err,earning){
      userEarningResult.object=earning;
      // Logger.info("userEarning details >>>>>>",userEarningResult.object);
      if(!err){
        domain.User_Earning_Bucket.find({$and: [

                                {user_id:userId },
                                {date_of_earning: {$gt:date,$lte:oneDayAfter}}
                            ]}).count(function(err,rescount){
         if(!err){
           userEarningResult.count=rescount;
          //  Logger.info(" count value is >",rescount);
           callback(err,SetResponse.setSuccess("user with its earning ",userEarningResult));
         }
       })
     }

    })
  }

module.exports = function (app) {
    return new UserDataService(app);
};
