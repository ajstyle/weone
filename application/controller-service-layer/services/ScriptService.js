var BaseService = require('./BaseService');

ScriptService = function (app) {
    this.app = app;
};

ScriptService.prototype.generate_user_parent_tree = function(params, callback){

  domain.User.count({deleted:false,role:'ROLE_USER'},function(err,count){
    // Logger.info("Number of users",count);
    if(!err){
      var skip = parseInt(params.skip);
      var limit = parseInt(params.limit);
      var total_users = parseInt(params.count);
      var counter = 0;
      var constant_limit = Math.abs(skip - total_users);
      total_users = constant_limit;
      if(limit>total_users){
        limit = total_users
      }
      // Logger.info("the constant_limit is",constant_limit);
      generate_tree_recursively(skip, limit, total_users, counter);
      callback(null,"Done")
    }else {
      callback(new Error("Internal Server Error"))
    }
  })
}

var generate_tree_recursively = function(skip, limit, total_users, loop_counter){
  // Logger.info("the params are",skip, limit, total_users, loop_counter);
  // var left_users = total_users;
  // Logger.info("Left USers",total_users-loop_counter)

  domain.User.find({role:'ROLE_USER',deleted:false},{name:1,phonenumber:1,inviter:1}).skip(skip).limit(limit).exec(function(err,response){

    async.forEach(response,function(res, pass){
      // left_users = total_users - loop_counter;
      // Logger.info("Users Left",loop_counter)
      async.auto({
        addTheParents:function(next,result){
          var counter = 0;
          var parents = [];
          // Logger.info("sending data first time");
          add_parents(counter, res._id, res, parents, next)
        },
        addTheUserCount:['addTheParents',function(next, result){
          var users = [res._id];
          var levels = [];
          add_user_count_per_level(1, res._id, users, levels, next)
        }],
        developMLMv3Tree:function(next, result){
          createMLMv3Tree(res._id, res.inviter, next);
        }
      },function(error,results){
          loop_counter+=1;
          // Logger.info("Left USers",total_users-loop_counter);
          pass();
      })
    },function(err){
        if(loop_counter<total_users){
        // if(loop_counter<constant_limit){
          // Logger.info("counter",loop_counter);
          skip = skip + limit;
          if(skip+limit>total_users){
            limit = total_users - loop_counter;
          }
          generate_tree_recursively(skip, limit, total_users, loop_counter);
        }else {
          // Logger.info("All Users Updated Successfully");
        }
    })
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

      callback(null,userNetworkObj);
      // var networkTree = new domain.User_Network_Tree(userNetworkObj);
      // networkTree.save(function(err,result){
      //   if(result){
      //     // Logger.info("saved successfully",result);
      //     callback(null,"Done")
      //   }else {
      //     // Logger.info("not saved",err);
      //     callback(new Error(err))
      //   }
      // })
    }
  }else {
    var userNetworkObj = {};
    userNetworkObj.user_id = user_id;
    userNetworkObj.number_of_levels = counter;
    userNetworkObj.parent_levels = parents;

    // var networkTree = new domain.User_Network_Tree(userNetworkObj);
    // networkTree.save(function(err,result){
    //   if(result){
    //     // Logger.info("saved successfully",result);
    //     callback(null,"Done")
    //   }else {
    //     Logger.info("not saved",err);
    //     callback(new Error(err))
    //   }
    // })
    callback(null,userNetworkObj);
  }

}

var add_user_count_per_level = function(counter, user_id, users, levels, callback){
  if(counter<=10){
    domain.User.find({inviter:{$in:users},deleted:false,role:'ROLE_USER'},{_id:1},function(err,res){
      if(res.length>0){
        var levelObj = {};
        levelObj.level_name = 'Level '+counter;
        levelObj.children_count = res.length;
        levels.push(levelObj);
        users = res.map(function(user){
          return user._id;
        })
        counter = counter+1;
        add_user_count_per_level(counter, user_id, users, levels, callback)
      }else {
        callback(null,levels)
        // domain.User_Network_Tree.update(
        //   {user_id:user_id},
        //   {$set:{child_levels_count:levels}},function(err,result){
        //     if(result){
        //       // Logger.info("saved successfully",result);
        //       callback(null,"Done")
        //     }else {
        //       Logger.info("not saved",err);
        //       callback(new Error(err))
        //     }
        //   })
      }

    })
  }else {
    callback(null,levels)
    // domain.User_Network_Tree.update(
    //   {user_id:user_id},
    //   {$set:{child_levels_count:levels}},function(err,result){
    //     if(result){
    //       // Logger.info("saved successfully",result);
    //       callback(null,"Done")
    //     }else {
    //       // Logger.info("not saved",err);
    //       callback(new Error(err))
    //     }
    //   })
  }
}


var createUserTree = function(userObj, callback){
  async.auto({
    addingParents:function(next,result){
      var counter = 0;
      var parents = [];
      add_parents(counter, userObj._id, userObj, parents, next)
    },
    addingChildCount:function(next,result){
      var users = [userObj._id];
      var levels = [];
      add_user_count_per_level(1, userObj._id, users, levels, next)
    }
  },function(err,results){
    var userNetworkObj = results.addingParents;
    userNetworkObj.child_levels_count = results.addingChildCount

    var networkTree = new domain.User_Network_Tree(userNetworkObj);
    networkTree.save(function(err,result){
      // Logger.info("the result is",err,result);
      if(result){
        // Logger.info("saved successfully",result);
        callback(null,result)
      }else {
        // Logger.info("not saved",err);
        callback(new Error(err))
      }
    })
  })
}

var createMLMv3Tree = function(user_id, inviter, callback){
  domain.User.find({inviter:user_id},{_id:1},function(err, result){
    // Logger.info("the ids are",result.length);
    var child_ids = result.map(function(child){
      return child._id;
    })
    var MLMv3Object = {};
    MLMv3Object.user_id = user_id;
    MLMv3Object.child_ids = child_ids;
    MLMv3Object.parent_id = mongoose.Types.ObjectId(inviter);
    MLMv3Object.child_count = child_ids.length;
    var saveMLMObj = new domain.MLMv3(MLMv3Object);
    saveMLMObj.save(function(err,savedObj){
      // Logger.info("the res is",err,savedObj);
      callback(null,savedObj);
    })
  })
}



ScriptService.prototype.searchUserIncome = function (date2,searchField, skip, limit, callback) {
    // Logger.info("date,email,skip and limit is ",date2,searchField,skip,limit);
    var userResult={};
    var resultOfUser={};
    var resultUser=[];
    async.auto({
      findAllUser:function(next,results){
        domain.User.find({$or: [{
                      name: {$regex: searchField,$options:'i'}
          }, {
                      email: {$regex: searchField,$options:'i'}
          }]},function(err,objects){
          // Logger.info("objects are",objects);
          next(err,objects);
 })

},

  searchAllUserIncome:['findAllUser',function(next,results){
      var userIds =results.findAllUser.map(function(user){

        return user._id;
      })
    // Logger.info("userIds is ",userIds);
      if (date2 != 0) {
            var date = new Date(date2);
            var date1 = new Date(date2);
            var oneDayAfter = new  Date(date1.setDate(date1.getDate() + 1));
    domain.User_Earning_Bucket.find({user_id:{$in:userIds},date_of_earning: {
     $gt: date,
     $lte: oneDayAfter}})
  .skip(skip)
  .limit(limit)
  .populate('user_id')
  .exec(function(err,earnings){
  userResult.object=earnings;
    if(skip !=0){
      // Logger.info("earning are",userResult);
 callback(err, SetResponse.setSuccess('user with its earning  with skip is',userResult));
}
else {
 domain.User_Earning_Bucket.find({user_id:{$in:userIds},date_of_earning: {
     $gt: date,
     $lte: oneDayAfter}}).count(function(err,count){
   userResult.count=count;

   callback(err, SetResponse.setSuccess('user with its earning  with skip is',userResult));
})
 }
  })
}
else {
  domain.User_Earning_Bucket.find({user_id:{$in:userIds}})
  .sort({
      date_of_earning: -1
  })
 .skip(skip)
 .limit(limit)
 .populate('user_id')
.exec(function(err,earnings){
    userResult.object=earnings;
  if(skip !=0){
callback(err, SetResponse.setSuccess('user with its earning  with skip is',userResult));
}
else {
domain.User_Earning_Bucket.find({user_id:{$in:userIds}}).count(function(err,count){
 userResult.count=count;

 callback(err, SetResponse.setSuccess('user with its earning  with skip is',userResult));
})
}
})
}
}]
})
}





ScriptService.prototype.generateMLM = function(req, callback){
  // Logger.info("the params are",req);
  domain.User.findOne({phonenumber:req.phonenumber},function(err,res){
    // Logger.info("the res is",err,res._id);
    async.auto({
      creatingMLM:function(next,result){
        createMLMv3Tree(res._id,res.inviter,next)
      }
    },function(err,results){
      callback(err, SetResponse.setSuccess('Created MLM',results));
    })
  })
}

ScriptService.prototype.generateTree = function(req, callback){
  // Logger.info("the params are",req);
  domain.User.findOne({phonenumber:req.phonenumber},function(err,res){
    // Logger.info("the res is",err,res._id);
    async.auto({
      creatingTree:function(next,result){
        createUserTree(res,next)
      }
    },function(err,results){
      callback(err, SetResponse.setSuccess('Created Tree',results));
    })
  })
}

module.exports = function (app) {
    return new ScriptService(app);
};
