/*This MLM service is used to create the balance binary tree in neo4j to achieve the MLM(Multi level Marketing) */

MLMService=function(){
    /*
    This function is used to save the Node information in the db.
    @newNodeId:node create in neo4j
    @parentnodeId:parent node for neo4j
    @user_details:User unique id for user details
    */
    var saveMLMObject = function (newNodeId, parentnodeId, user_details) {
    //Logger.info(newNodeId, parentnodeId);
    var mlmobj = new domain.MLM({
        node_id: newNodeId,
        parent_node: parentnodeId,
        child_node1: 0,
        child_node2: 0,
        user_details: user_details
    });
    mlmobj.save(function (err, obj) {
        //Logger.info("object saved");
    });
    createRelationInNode(newNodeId, parentnodeId);
}
var createRelationInNode = function (newNodeId, parentnodeId) {
    //Logger.info("control in the createRelationInNode");
    neo4jDbConnection.insertRelationship(parentnodeId, newNodeId, 'Relationship', {}, function (err, node) {

    })
}
MLMService.createUserNode = function (user,inviter) {
  //Logger.info("the inviter value is",inviter);
  // if(inviter){
  //   Logger.info("helllo inside the inviter conditions");
  //   addNodeToInviterTree(user,inviter);
  // }else {
  //
  // }

  //Logger.info('control in the createUserNode function' + user);
  var userObj = {};
  userObj.name = user.name;
  userObj.deleted = false;
  userObj.email = user.email;
  userObj.createdAt = user.createdAt;
  userObj.gender = user.gender;
  userObj.phonenumber = user.phonenumber;
  userObj.age = user.age;
  userObj.objectId = user._id;
  userObj.balance = 0;
  //Logger.info(userObj)
  neo4jDbConnection.insertNode(userObj, 'user', function (err, node) {
      //Logger.info(node);
      var newNodeId = node._id;
      domain.User.findOneAndUpdate({
          _id: user._id
      }, {
          neo4J_node_id: newNodeId
      }, null, function (err, updateObject) {
          //Logger.info("the user is updated in neo4j",err,updateObject);
      })
      neo4jDbConnection.cypherQuery("match(n:user) where n.deleted=true return n", function (err, result) {
          //Logger.info("the deleted user are",err,result);
          if (result.data.length != 0 && !inviter) {
              //Logger.info("Inside the deletion module non-invited");
              var deletedNodeId = result.data[0]._id;
              neo4jDbConnection.readIncomingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                  if (obj.length != 0) {
                      //Logger.info(obj[0]._id, "total parent node", obj.length)
                      var parentRelationId = obj[0]._id;
                      var parentNodeId = obj[0]._start;
                  }
                  neo4jDbConnection.readOutgoingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                      //Logger.info("total number of child node", obj.length)
                      //Logger.info(parentNodeId);
                      if (obj.length != 0) {
                          var child_node1 = obj[0]._end;
                          if (obj[1])
                              var child_node2 = obj[1]._end;
                      }
                      //Logger.info("control in the creating relationship between differnt node");
                      neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)= " + deletedNodeId + " DETACH DELETE n", function (err, obj) {
                        //Logger.info("deleted",deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user._id);
                        createRelationShipWithNodes(deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user._id,null);
                      });
                  });
              });
          } else {
              if(inviter){
                //Logger.info("inside the invited module");
                var returned_flag = false;
                async.auto({
                  step1:function(next,results){
                    //Logger.info("Checking the no of deleted nodes under the inviter tree");
                    return isDeletedNodeExistsThenUpdate(user,inviter,newNodeId, user._id, next);
                    //next(null);
                  },
                  addNodeToInviterTree:['step1',function(next,results){
                    //Logger.info("Inside addNodeToInviterTree",user,inviter,newNodeId, user._id,results);
                    if(!results.step1){
                      //Logger.info("the returned_flag",results);
                      addNodeToInviterTree(user,inviter,newNodeId, user._id);
                    }
                    next(null);
                  }]
                },function(err,results){
                    //Logger.info("the results are",err,results);
                })
              }else {
                addNewNodeMLM(newNodeId, user._id);
              }
          }
      });
  });

}

var createRelationShipWithNodes = function (deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user_details,next_fn) {
    if (!parentNodeId){
      parentNodeId = 0;
    }
    //Logger.info("the value of next is",next_fn);
    //Logger.info("inside createRelationShipWithNodes",deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user_details);
    async.auto({
      step1:function(next,results){
        domain.MLM.findOneAndUpdate({
            node_id: deletedNodeId
        }, {
            node_id: newNodeId,
            user_details: user_details
        }, null, function (err, obj) {
          //Logger.info("1");
            ////Logger.info("mlm db is update with delete",err,obj)
            //Logger.info("the deleted node is replaced",err,obj);
            next(null);
        });
      },
      step2:['step1',function(next,results){
        domain.MLM.find({
            node_id: parentNodeId
        }, function (err, obj) {
          //Logger.info("2");
            //Logger.info("mlm db is update child node with delete node");
            if (obj.child_node1 == deletedNodeId) {
              //Logger.info("3");
                domain.MLM.findOneAndUpdate({
                    node_id: parentNodeId
                }, {
                    child_node1: newNodeId
                }, null, function (err, obj) {
                    //Logger.info("child1 node is updated ", err,obj)
                    next(null);
                });
            } else {
              //Logger.info("4");
                domain.MLM.findOneAndUpdate({
                    node_id: parentNodeId
                }, {
                    child_node2: newNodeId
                }, null, function (err, obj) {
                    //Logger.info("child 2 node is updated",err,obj)
                    next(null);
                });
            }
        });
      }]
    },function(err,result){
      if (parentNodeId == 0) {
        //Logger.info("5");
          //Logger.info("Ids", newNodeId, child_node1, child_node2);

          neo4jDbConnection.cypherQuery("Match(n:user),(c1:user),(c2:user) where  ID(n)={n1} and ID(c1)={c1} and ID(c2)={c2} create (n)-[r1:Relationship]->(c1),(n)-[r2:Relationship]->(c2)", {
              n1: newNodeId,
              c1: child_node1,
              c2: child_node2
          }, function (err, obj) {
            if(next_fn){
              next_fn(null);
            }
            //Logger.info("the response5 is",err,obj);
          });

      } else if (child_node2) {
        //Logger.info("6");

          //Logger.info("Ids", parentNodeId, newNodeId, child_node1, child_node2);

          neo4jDbConnection.cypherQuery("Match(p:user),(n:user),(c1:user),(c2:user) where ID(p)={p1} and ID(n)={n1} and ID(c1)={c1} and ID(c2)={c2} create (p)-[r:Relationship]->(n),(n)-[r1:Relationship]->(c1),(n)-[r2:Relationship]->(c2)", {
              p1: parentNodeId,
              n1: newNodeId,
              c1: child_node1,
              c2: child_node2
          }, function (err, obj) {
            if(next_fn){
              next_fn(null);
            }
            //Logger.info("the response6 is",err,obj);
          });
      } else if (child_node1) {
        //Logger.info("7");
          //Logger.info("Ids", parentNodeId, newNodeId, child_node1);
          neo4jDbConnection.cypherQuery("Match(p:user),(n:user),(c1:user) where ID(p)={p1} and ID(n)={n1} and ID(c1)={c1}  create (p)-[r:Relationship]->(n),(n)-[r1:Relationship]->(c1)", {
              p1: parentNodeId,
              n1: newNodeId,
              c1: child_node1
          }, function (err, obj) {
            if(next_fn){
              next_fn(null);
            }
            //Logger.info("the response7 is",err,obj);
          });
      } else {
        //Logger.info("8");
          createRelationInNode(newNodeId, parentNodeId);
          if(next_fn){
            next_fn(null);
          }
      }
    })
}

var addNewNodeMLM = function (newNodeId, user_details) {
    //Logger.info("contorl in the add new node avl tree")
    domain.MLM.find({
        $or: [{
            child_node1: 0
             }, {
            child_node2: 0
                       }]
    }).sort({
        Date: 1
    }).exec(function (err, obj) {
        if (obj != '') {
            if (obj[0].child_node1 == 0) {
                //Logger.info("child_node1 0")
                domain.MLM.findOneAndUpdate({
                    _id: obj[0]._id
                }, {
                    child_node1: newNodeId
                }, null, function (err, obj) {
                    saveMLMObject(newNodeId, obj.node_id, user_details);
                });
            } else if (obj[0].child_node2 == 0) {
                //Logger.info("child node2 0");
                domain.MLM.findOneAndUpdate({
                    _id: obj[0]._id
                }, {
                    child_node2: newNodeId
                }, null, function (err, obj) {
                    saveMLMObject(newNodeId, obj.node_id, user_details);
                });
            } else {
                //Logger.info("in invalid state");
            }
        } else {
            //Logger.info('control in create admin obj');
            var mlmobj = new domain.MLM({
                node_id: newNodeId,
                parent_node: 0,
                child_node1: 0,
                child_node2: 0,
                user_details: user_details
            });
            mlmobj.save(function (err, obj) {
                //Logger.info("object is saved successfully");
                //callback(err, obj);
            });
        }
    });
}

var addNodeToInviterTree = function(user, inviter, newNodeId, user_details){

  // neo4jDbConnection.cypherQuery("MATCH p =(user {objectId:"+inviter._id+"})-->() RETURN p",RETURN nodes(path) AS nodes
  neo4jDbConnection.cypherQuery("MATCH (user:user{ objectId:'"+inviter._id+"'}) MATCH p=(user)-[*]->(post) RETURN nodes(p) AS nodes ORDER BY length(p) DESC",
    function (err, obj) {
      //Logger.info("the cql obj is",obj.data);
      var userIds = [];
      userIds.push(inviter._id);
      var non_rep = [];
          if(!err){
            obj.data.forEach(function(node){
              node.forEach(function(user){
                // Logger.info("user ",user.data.objectId);
                userIds.push(user.data.objectId);
              })
            })
            userIds.forEach(function(user){
              var flag=0;
              non_rep.forEach(function(nr){
                if(user == nr){
                  flag=1;
                }
              })
              if(flag!=1){
                non_rep.push(user)
              }
            })

            // var userIds = obj.data.map(function(user){
            //   return user.data;
            // })
            //Logger.info("the user ids are as follows:",non_rep);
            domain.MLM.find(
              {
                  $and : [
                      {user_details:{$in:non_rep}},
                      { $or : [ {child_node1: 0}, {child_node2: 0} ] }
                  ]
              }).sort({Date:1}).exec(function(err,obj){
              //Logger.info("the response is",err,obj,obj.length);
              // obj.forEach(function(user){
              //   Logger.info(user.user_details," ",user.child_node1," ",user.child_node2);
              // })
              if(!err){
                if (obj != '') {
                    if (obj[0].child_node1 == 0) {
                        //Logger.info("child_node1 0")
                        domain.MLM.findOneAndUpdate({
                            _id: obj[0]._id
                        }, {
                            child_node1: newNodeId
                        }, null, function (err, obj) {
                            saveMLMObject(newNodeId, obj.node_id, user_details);
                        });
                    } else if (obj[0].child_node2 == 0) {
                        //Logger.info("child node2 0");
                        domain.MLM.findOneAndUpdate({
                            _id: obj[0]._id
                        }, {
                            child_node2: newNodeId
                        }, null, function (err, obj) {
                            saveMLMObject(newNodeId, obj.node_id, user_details);
                        });
                    } else {
                        //Logger.info("in invalid state");
                    }
                } else {
                    //Logger.info('control in create admin obj');
                    var mlmobj = new domain.MLM({
                        node_id: newNodeId,
                        parent_node: 0,
                        child_node1: 0,
                        child_node2: 0,
                        user_details: user_details
                    });
                    mlmobj.save(function (err, obj) {
                        //Logger.info("object is saved successfully");
                        //callback(err, obj);
                    });
                }
              }
            })
          }else {
            //Logger.info("there is error",err);
            //callback(new Error("Internal Server Error"));
          }
  });
}

var isDeletedNodeExistsThenUpdate = function(user, inviter, newNodeId, user_details, next_fn){
  neo4jDbConnection.cypherQuery("MATCH (user:user{ objectId:'"+inviter._id+"'}) MATCH p=(user)-[*]->(post) RETURN nodes(p) AS nodes ORDER BY length(p) DESC",
  function(err,result){
    if(!err){
      var userIds = [];
      var flag1=0;
      async.auto({
        findDeletedUsers:function(next,results){
          result.data.forEach(function(node){
            node.forEach(function(user){
              //Logger.info("the user is",user.data);
              if(user.data.deleted){
                userIds.push(user.metadata.id);
              }
            })
          })
          next(null);
        },
        replaceWithInvitedUser:['findDeletedUsers',function(next,results){
        //Logger.info("the user ids are",userIds,userIds.length);
          if(userIds.length>0){
            //Logger.info("there is deleted user in the tree",userIds[0]);
            var deletedNodeId = userIds[0];
            neo4jDbConnection.readIncomingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                if (obj.length != 0) {
                    //Logger.info(obj[0]._id, "total parent node", obj.length)
                    var parentRelationId = obj[0]._id;
                    var parentNodeId = obj[0]._start;
                }
                neo4jDbConnection.readOutgoingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                    //Logger.info("total number of child node", obj.length)
                    //Logger.info(parentNodeId);
                    if (obj.length != 0) {
                        var child_node1 = obj[0]._end;
                        if (obj[1])
                            var child_node2 = obj[1]._end;
                    }
                    //Logger.info("control in the creating relationship between differnt node");
                    neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)= " + deletedNodeId + " DETACH DELETE n", function (err, obj) {

                        //Logger.info("the query of deletion response is",err,obj);
                        if(!err){
                          //Logger.info("deleted",deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user._id);
                          createRelationShipWithNodes(deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user._id,next);
                          flag1=1;
                          //next(null)
                        }else {
                          next(null)
                          //Logger.info("there is some error in deleting the node adding at some other place",err);
                        }
                    });
                });
            });
          }else {
            //Logger.info("there is no deleted user in the tree");
            next(null)
          }

            //return false;isDeletedNodeExistsThenUpdate
        }]
      },function(err,results){
          if(flag1==1){
            //Logger.info("returning true");
            next_fn(true);
            //return true;
          }else {
            //Logger.info("returning false");
            // return false;
            next_fn(false);
          }
      })
    }else {
      //Logger.info("There is some error",err);
      return false;
    }
  })
}

MLMService.createUserNodeV3 = function(user, inviter){
  createNetworkTree(user, inviter._id);
  domain.MLMv3.update({user_id:inviter._id},{$addToSet:{child_ids:user._id},$inc:{child_count:1}},
    function(err, parentUpdate){
    // Logger.info("Parent MLM updated Successsfully",err,parentUpdate)
  })
  var mlmobj = new domain.MLMv3({
      user_id: user._id,
      parent_id: inviter._id,
      child_ids:[]
  });
  mlmobj.save(function (err, obj) {
      // Logger.info("object is saved successfully");
  });
}

MLMService.createUserNodeV2 = function (user,inviter) {
  var userObj = {};
  userObj.name = user.name;
  userObj.deleted = false;
  userObj.email = user.email;
  userObj.createdAt = user.createdAt;
  userObj.gender = user.gender;
  userObj.phonenumber = user.phonenumber;
  userObj.age = user.age;
  userObj.objectId = user._id;
  userObj.balance = 0;
  var inviter_id = inviter.neo4J_node_id;
  neo4jDbConnection.insertNode(userObj, 'user', function (err, node) {
    var newNodeId = node._id;
    domain.User.findOneAndUpdate({
        _id: user._id
    }, {
        neo4J_node_id: newNodeId
    }, null, function (err, updateObject) {


      domain.MLMv2.update({node_id:inviter_id},{$addToSet:{child_nodes:newNodeId}},
        function(err, parentUpdate){
        // Logger.info("Parent Node updated Successsfully",err,parentUpdate)
      })
      var mlmobj = new domain.MLMv2({
          node_id: newNodeId,
          parent_node: inviter_id,
          user_details: user._id
      });
      mlmobj.save(function (err, obj) {
          // Logger.info("object is saved successfully");
      });
        // Logger.info("the user is updated in neo4j",err,updateObject);
    })
    neo4jDbConnection.insertRelationship(inviter_id, newNodeId, 'Relationship',{},
      function(err, relationship){
        if(err) throw err;
        else {
          //Adding Asynchronously to the Network
          createNetworkTree(user, inviter_id);
          // addNewUserInNetworkTree(user, inviter_id, newNodeId)
        }
        // Logger.info("the created relation is",err,relationship);
    });
  });
}

var createNetworkTree = function(user, inviter_id){
  async.auto({
    addTheParents:function(next,result){
      var counter = 0;
      var parents = [];
      // Logger.info("sending data first time");
      add_parents(counter, user._id, user, parents, next)
    },
    updateParentsTree:['addTheParents',function(next, result){
      updating_child_count_in_parents_tree(result.addTheParents,next);
    }]
  },function(error,results){

  })
}

var add_parents = function(counter, user_id, userObj, parents, callback){
  // Logger.info("counter",counter, user_id, userObj, parents);
  if(counter<11){
    var number = counter;
    var levelObj = {};
    levelObj.level_name = 'Level '+number;
    levelObj.user_id = userObj._id;
    levelObj.name = userObj.name;
    levelObj.phonenumber = userObj.phonenumber;
    if(counter!=0){
      parents.push(levelObj);
    }
    if(userObj.inviter){
      counter = counter+1;
      domain.User.findOne({_id:userObj.inviter},{_id:1,name:1,phonenumber:1,inviter:1},
        function(err,res){
          add_parents(counter, user_id, res, parents, callback)
      })
    }else {
      var userNetworkObj = {};
      userNetworkObj.user_id = user_id;
      userNetworkObj.number_of_levels = counter;
      userNetworkObj.parent_levels = parents;

      var networkTree = new domain.User_Network_Tree(userNetworkObj);
      networkTree.save(function(err,result){
        if(result){
          // Logger.info("saved successfully",result);
          callback(null,result)
        }else {
          // Logger.info("not saved",err);
          callback(new Error(err))
        }
      })
    }
  }else {
    var userNetworkObj = {};
    userNetworkObj.user_id = user_id;
    userNetworkObj.number_of_levels = counter;
    userNetworkObj.parent_levels = parents;

    var networkTree = new domain.User_Network_Tree(userNetworkObj);
    networkTree.save(function(err,result){
      if(result){
        // Logger.info("saved successfully",result);
        callback(null,result)
      }else {
        // Logger.info("not saved",err);
        callback(new Error(err))
      }
    })
  }
}

var updating_child_count_in_parents_tree = function(networkTree, callback){
  var counter = 0;
  async.forEach(networkTree.parent_levels,function(parent, pass){
    counter = counter+1;
    var level_name = 'Level '+counter;
    domain.User_Network_Tree.update(
      {user_id:parent.user_id,'child_levels_count.level_name':level_name},
      {$inc:{'child_levels_count.$.children_count':1}},function(error,res){
        // Logger.info("the response of network update is",error,res);
        // Logger.info("the response of network update is",error,res);
        if(!error){
          if(res.nModified==0){
            domain.User_Network_Tree.findOne({
              user_id:parent.user_id},function(er,networkTree){
                if(networkTree){
                  // Logger.info("if condn true");
                  var level_no = parseInt(networkTree.child_levels_count.length)+1;
                  var levelObj = {};
                  levelObj.children_count = 1;
                  levelObj.level_name = 'Level '+level_no;
                  // Logger.info("the object is",levelObj);
                  domain.User_Network_Tree.update(
                    {user_id:parent.user_id},
                    {$push:{child_levels_count:levelObj}},function(err,treeRes){
                      // Logger.info("inside pushing the new level",err,treeRes);
                      if(!err){
                        // Logger.info("Success");
                      }else {
                        // Logger.info("Some error",err);
                      }
                    }
                  )
                }else {
                  // Logger.info("Some error",er);
                }
              })
          }else {
            // Logger.info("Success");
          }
        }else {
          // Logger.info("Some error",error);
        }
        pass();
      })
  },function(err){
    callback(null,"Successfully Updated the Tree")
  })
}

}
module.exports=MLMService;
