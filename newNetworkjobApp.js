global.configurationHolder = require('./configurations/DependencyInclude.js')
global.myApp = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
var _ = require('lodash');
console.log("myApp started in %s mode", myApp.settings.env);
var sync = require('synchronize')
var CronJob = require('cron').CronJob;
var MongoClient = require('mongodb').MongoClient;

// redis_client = redis.createClient(configurationHolder.config.redisConf);

// redis_client.on('connect', function() {
//   console.log('Connected to redis master.');
// });


var updateCache = function(){
  domain.Authentication_Token.findOne({authToken:"e13c5970-8c80-11e6-9682-7b1778164b84"},function(err,res){
    var query = domain.User.find({_id:res.user});

    redis_client.get(getCacheKeyByQuery(query), function(err, rows) {

      console.log("the res is",JSON.parse(rows));
      rows = JSON.parse(rows);
      rows.name = 'Successfully Achieved Again!!!!!!!!!!!!'
      redis_client.set(getCacheKeyByQuery(query), JSON.stringify(rows), function(err, rows) {

      });
    });

    // console.log("the keys is",getCacheKeyByQuery(query));
  })
}


var igniter = function(){
  domain.Authentication_Token.findOne({authToken:"e13c5970-8c80-11e6-9682-7b1778164b84"},function(err,res){
    var query = domain.User.find({_id:res.user},function(err,result){
      console.log("the result is",err,result);
    });
    console.log("the keys is",getCacheKeyByQuery(query));
  })

  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }

  // var query = domain.Advert.find({
  //     advert_status: 'ready',
  //     deleted: false,
  //     "schedule.end_date": {
  //       $gte:todaydate
  //     },
  //     "schedule.start_date": {
  //       $lte:todaydate
  //     }
  // }).skip(0).limit(0).populate("client_details._id", "logo_image_url client_org_name phonenumber").sort({
  //     "schedule.start_date": -1
  // });
  //
  // console.log("the keys is",getCacheKeyByQuery(query));

}

var getCacheKeyByQuery = function(dbQuery){
  var model = dbQuery.model;

  var query = dbQuery._conditions || {};
  var options = dbQuery._optionsForExec(model) || {};
  var fields = _.clone(dbQuery._fields) || {};
  var populate = dbQuery._mongooseOptions.populate || {};
  var collectionName = model.collection.name;

  var hash = crypto.createHash('md5')
    .update(JSON.stringify(query))
    .update(JSON.stringify(options))
    .update(JSON.stringify(fields))
    .update(JSON.stringify(populate))
    .digest('hex');
  var key = ['weone', collectionName, hash].join(':');

  return key;
}

// igniter();
// updateCache();

var get_user_count_per_level = function(counter, user_id, users, levels){
  if(counter<=10){
    console.log("the users is",users);
    domain.MLMv3.find({user_id:{$in:users}},function(err,result){
      console.log("the count",result.length);
      var array = [];
      async.forEach(result,function(user,callback){
        array.concat(user.child_ids);
        callback();
      },function(err){

        counter = counter+1;
        var levelObj = {};
        levelObj.level_name = 'Level '+counter;
        levelObj.children_count = array.length;
        levels.push(levelObj);
        get_user_count_per_level(counter,user_id,array,levels);
      })


    })
    // domain.User.find({inviter:{$in:users},deleted:false,role:'ROLE_USER'},{_id:1},function(err,res){
    //   if(res.length>0){
    //     console.log("the inviters length is",res.length);
    //     var levelObj = {};
    //     levelObj.level_name = 'Level '+counter;
    //     levelObj.children_count = res.length;
    //     levels.push(levelObj);
    //     users = res.map(function(user){
    //       return user._id;
    //     })
    //     counter = counter+1;
    //     get_user_count_per_level(counter, user_id, users, levels)
    //   }else {
    //     console.log("the levels are",levels);
    //     // domain.User_Network_Tree.update(
    //     //   {user_id:user_id},
    //     //   {$set:{child_levels_count:levels}},function(err,result){
    //     //     if(result){
    //     //       // Logger.info("saved successfully",result);
    //     //       callback(null,"Done")
    //     //     }else {
    //     //       Logger.info("not saved",err);
    //     //       callback(new Error(err))
    //     //     }
    //     //   })
    //   }
    //
    // })
  }else {
    console.log(levels);

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

var demo = function(){
  domain.User.findOne({phonenumber:918826363799},function(err,res){
    // domain.mlmv3.find({user_id:res._id},function(err,res){
    // console.log("the ph is",res.phonenumber);
      var user_id = res._id;
      var users = [];
      users.push(mongoose.Types.ObjectId(user_id.toString()));
      var levels = [];
      var counter = 1;
      get_user_count_per_level(counter, user_id, users, levels);
    // })
  })
}

demo();
myApp.listen(6666);
