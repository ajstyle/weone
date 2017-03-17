global.configurationHolder = require('./configurations/DependencyInclude.js')
global.networkjobApp = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
Logger.info("Money Distribution Job is Running in ", networkjobApp.settings.env," mode !!");
var sync = require('synchronize')
var CronJob = require('cron').CronJob;
global.neo4jDbConnection = new neo4j(configurationHolder.config.neo4jUrl);
var MongoClient = require('mongodb').MongoClient;

var redis_client = redis.createClient(configurationHolder.config.redisConf);

redis_client.on('connect', function() {
  console.log('Connected to Redis master in money job.');
});


var moneyPercentagePerLevelMap = {};

moneyPercentagePerLevelMap[00] = 10;
moneyPercentagePerLevelMap[01] = 10;
moneyPercentagePerLevelMap[02] = 08;
moneyPercentagePerLevelMap[03] = 06;
moneyPercentagePerLevelMap[04] = 05;
moneyPercentagePerLevelMap[05] = 04;
moneyPercentagePerLevelMap[06] = 03;
moneyPercentagePerLevelMap[07] = 02;
moneyPercentagePerLevelMap[08] = 01;
moneyPercentagePerLevelMap[09] = 01;
moneyPercentagePerLevelMap[10] = 10;
MongoClient.connect("mongodb://qwertyr:UnQP_s3dZd@10.10.50.253:27017/Weone", function(err, db) {
//MongoClient.connect("mongodb://admin:admin@10.10.50.130:27017/Weone", function(err, db) {
// MongoClient.connect("mongodb://admin:admin@localhost:27017/Weone", function(err, db) {
  var job = new CronJob({
      // cronTime: '00 1 19 * * *',
      cronTime: '01 00 19 * * *',
      onTick: function () {
  	      Logger.info("job initiated",new Date());
          Logger.info("your network job start running", new Date());
          distrbuteMoney();
      },
      start: true
  });
  job.start();

  var User_Earning_Buckets = db.collection('userearningbuckets');
  var Users = db.collection('users');
  var Admin_Earning_Details = db.collection('admin_earning_details');
  var Admin_Earning_Bucket = db.collection('admin_earning_buckets');

  var User_Earning_Buckets_Batch = User_Earning_Buckets.initializeOrderedBulkOp();    //User_Earning_Buckets.initializeOrderedBulkOp();
  var Users_Batch = Users.initializeOrderedBulkOp();
  var Admin_Earning_Details_Batch = Admin_Earning_Details.initializeOrderedBulkOp();
  var Admin_Earning_Bucket_Batch = Admin_Earning_Bucket.initializeOrderedBulkOp();


  var distrbuteMoney = function(){
    var skip = 0;
    var limit = 1000;
    var todaydate = new Date();
    todaydate.setHours(0, 0, 0, 0);
    var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
    var onedayAfter = new Date(todaydate.setDate(todaydate.getDate() + 1));

    domain.Advert.find({
       "schedule.start_date":{$lt:todaydate,$gt:oneDayPrevious},    //DATE CONDN ON SERVER
      // "schedule.end_date":{$gt:new Date("Thu Dec 21 2016 00:00:00 GMT+0000 (UTC)"),$lt:new Date("Fri Dec 22 2016 00:00:00 GMT+0000 (UTC)")},   //ON LOCAL
      // "schedule.end_date":{$gt:new Date("Tue Sep 14 2016 00:00:00 GMT+0000 (UTC)"),$lt:new Date("Wed Sep 15 2016 00:00:00 GMT+0000 (UTC)")},  // ON STAGING
      deleted: false
    },function(err,adverts){
      if(adverts.length>0){
        var advert_ids = adverts.map(function(advert){
          Logger.info("the ads are",advert.name_of_advert);
          return advert._id;
        })
        domain.Ad_View_History.aggregate(
          [{$match:{ad_id :{$in:advert_ids},"complete_view" : true}},
          {
            $group: {
                _id: {
                  user_id:"$userView._id",
                  ad_id:"$ad_id"
                },
                views: {
                    $sum:1
                }
            }
        },{
          $out:'users_views'
        }],function(err,users_views_aggregate){
          Logger.info("the users count in new fn are",err,users_views_aggregate);
          db.collection('users_views').find({}).toArray(function(err,users_views){
            if(users_views.length>0){
              var user_adview_map = {};
              var distinct_users = [];
              var eligible_users = {};
              var distinct_eligible_viewers = [];

              async.forEach(users_views,function(user,pass){
                // Logger.info("the arrraaay",user);
                if(!user_adview_map[user._id.user_id]){
                  var viewedAds = [user._id.ad_id];
                  user_adview_map[user._id.user_id] = {};
                  user_adview_map[user._id.user_id].viewedAds = viewedAds;
                  // distinct_users.push(mongoose.Types.ObjectId(user._id.user_id));
                  distinct_users.push(user._id.user_id);
                }else {
                  user_adview_map[user._id.user_id].viewedAds.push(user._id.ad_id);
                  if(user_adview_map[user._id.user_id].viewedAds.length==3){
                    eligible_users[user._id.user_id]= {}//'ELIGIBLE';
                    eligible_users[user._id.user_id].earnedMoney = 0;
                    distinct_eligible_viewers.push(user._id.user_id);
                  }
                }
                pass();
              },function(err){
                Logger.info("the ads view map is",Object.keys(eligible_users).length);
                  Logger.info("distinct_eligible_viewers",distinct_users.length,distinct_eligible_viewers.length);
                  var todaydate = new Date();
                  // var todaydate = new Date("Mon Dec 21 2016 00:00:00 GMT+0000 (UTC)")
                  todaydate = new Date(todaydate.setHours(19, 0, 0, 0));
                  //creating eligible users earning buckets
                  var User_Earning_Buckets_Save_Batch = User_Earning_Buckets.initializeUnorderedBulkOp();
                  async.forEach(distinct_eligible_viewers, function(user, localCallback){
                    var earningObject = {};
                    earningObject.createdAt = new Date();
                    earningObject.updatedAt = new Date();
                    earningObject.deletedAt = null
                    earningObject.deleted = false
                    earningObject.user_id= user;
                    earningObject.total_amount=0;
                    earningObject.date_of_earning= todaydate//new Date();
                    // earningObject.date_of_earning= new Date("Mon Dec 12 2016 18:00:00 GMT+0000 (UTC)")
                    earningObject.earning_details= [];
                    earningObject.total_number_of_earning= 0;
                    User_Earning_Buckets_Save_Batch.insert(earningObject);
                    localCallback();
                    },function(err){
                      User_Earning_Buckets_Save_Batch.execute(function(err, response){
                      if(!err){
                         domain.Admin_Earning_Bucket.count(
                           {
                             date_of_earning:{
                               $gte:todaydate
                               // $gte:new Date("Tue Oct 16 2016 19:00:00 GMT+0000 (UTC)")
                             },
                             deleted:false
                           },
                           function(err,countRes){
                           if(countRes<1){
                             domain.Admin_Earning_Details.findOne({deleted:false},{_id:1},function(err,res){
                               Logger.info("creating the admin earning bucket");
                               var admin_earning_obj = {};
                               admin_earning_obj.admin_id = res._id;
                               admin_earning_obj.date_of_earning = todaydate//new Date();
                              //  admin_earning_obj.date_of_earning = new Date("Tue Oct 16 2016 19:00:00 GMT+0000 (UTC)");
                               var adminSave = new domain.Admin_Earning_Bucket(admin_earning_obj);
                               adminSave.save(function(err,resSave){
                                 // Logger.info("the resp s",err,resSave._id);
                                 domain.Admin_Earning_Details.update({deleted:false},
                                   {$push:{buckets:resSave._id},
                                   $inc:{bucket_count:1}},
                                   function(err,result){
                                 });
                               })
                             })
                           }else {
                             Logger.info("not creating the admin earning bucket");
                           }
                           var ad_parentlevels_map = {};
                           var all_money_to_admin = {};
                           var partial_money_to_admin = {};

                           async.forEach(adverts, function(advert,callback1){

                             partial_money_to_admin[advert._id] = [];
                             all_money_to_admin[advert._id] = [];

                             ad_parentlevels_map[advert._id] = {};
                             ad_parentlevels_map[advert._id].advert = advert;

                             callback1();
                           },function(err1){
                             var paramsObj = {};
                             paramsObj.skip = skip;
                             paramsObj.limit = limit;
                             paramsObj.adverts = adverts;
                             paramsObj.eligible_users = eligible_users;
                             paramsObj.user_adview_map = user_adview_map;
                             paramsObj.ad_parentlevels_map = ad_parentlevels_map;
                             paramsObj.all_money_to_admin = all_money_to_admin;
                             paramsObj.partial_money_to_admin = partial_money_to_admin;
                             paramsObj.distinct_users = distinct_users;
                             paramsObj.distinct_eligible_viewers = distinct_eligible_viewers;
                             paramsObj.total_users = distinct_users.length;
                            //  Logger.info("the params are",paramsObj.total_users,paramsObj.skip,paramsObj.limit);
                             distributeMoneyInBatches(paramsObj);
                           })
                         })
                       }else {
                         Logger.info("the res is",err);
                       }
                     })
                  })
            })
            }else {
              Logger.info("No Viewers Today")
            }
            // console.log("tthe new res is",err,users_views_db[1]);
            // var users_views = JSON.parse(JSON.stringify(users_views))
            // var users_views_db = [];
            // async.forEach(users_views_db,function(user,pas){
            //   var resObj = {};
            //   resObj._id = {};
            //   resObj._id.user_id = mongoose.Types.ObjectId(user._id.user_id.toString());
            //   resObj._id.ad_id = mongoose.Types.ObjectId(user._id.ad_id.toString());
            //   resObj.views = user.views;
            //   users_views_db.push(resObj);
            //   pas();
            // },function(err){
            //     console.log("the response of array is",users_views);
            //
            // })

          })
      })
      }else {
        Logger.info("No ADS For Today")
      }
  }
)}

  var distributeMoneyInBatches = function(paramsObj){

    var skip = paramsObj.skip;
    var limit = paramsObj.limit;
    var adverts = paramsObj.adverts;
    var eligible_users = paramsObj.eligible_users;
    var user_adview_map = paramsObj.user_adview_map;
    var ad_parentlevels_map = paramsObj.ad_parentlevels_map;
    var all_money_to_admin = paramsObj.all_money_to_admin;
    var partial_money_to_admin = paramsObj.partial_money_to_admin;
    var distinct_eligible_viewers = paramsObj.distinct_eligible_viewers;
    var distinct_users = paramsObj.distinct_users;

    domain.User_Network_Tree.find({user_id:{$in:distinct_users}},{parent_levels:1,user_id:1}).skip(skip).limit(limit).exec(function(err,networkTrees){
      // console.log("length is with skip and limit",err,eligible_users,networkTrees.length,skip,limit);
      var userIds = [];
      async.forEach(networkTrees,function(networkTree,callback2){
        userIds.push(networkTree.user_id);
          if(eligible_users[networkTree.user_id]){
            user_adview_map[networkTree.user_id].viewedAds.forEach(function(ad_id){
              var count = 0;
              var percentage_for_user = moneyPercentagePerLevelMap[0];

              var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
              var percentage = moneyPercentagePerLevelMap[count];
              var earnedMoney = price_per_view * percentage /100;
              eligible_users[networkTree.user_id].earnedMoney = eligible_users[networkTree.user_id].earnedMoney + earnedMoney;
              // Logger.info("the earned money is",earnedMoney,ad_parentlevels_map[ad_id].advert.cost_per_view);
              async.forEach(networkTree.parent_levels,function(parent_level, pass){
                count = count + 1;
                if(count == 1){
                  if(eligible_users[parent_level.user_id]){

                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 2){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_2.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 3){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_3.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 4){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_4.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 5){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_5.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 6){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_6.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 7){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_7.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 8){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_8.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else if(count == 9){
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_9.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }else{
                  if(eligible_users[parent_level.user_id]){
                    var price_per_view = ad_parentlevels_map[ad_id].advert.cost_per_view
                    var percentage = moneyPercentagePerLevelMap[count];
                    var earnedMoney = price_per_view * percentage /100;
                    eligible_users[parent_level.user_id].earnedMoney = eligible_users[parent_level.user_id].earnedMoney + earnedMoney;

                    // ad_parentlevels_map[ad_id].level_10.push(parent_level.user_id);
                  }else {
                    partial_money_to_admin[ad_id].push(moneyPercentagePerLevelMap[count]);
                  }
                }
                percentage_for_user = percentage_for_user + moneyPercentagePerLevelMap[count];
                pass();
              },function(err){
                //send the left out money to admin
                partial_money_to_admin[ad_id].push(100-percentage_for_user);
                // partial_money_to_admin.push(100-percentage_for_user);
              })
            })
            callback2();
          }else {
            //send all money to admin
            user_adview_map[networkTree.user_id].viewedAds.forEach(function(ad_id){
              all_money_to_admin[ad_id].push(networkTree.user_id);
            })
            callback2();
          }
        },function(err2){
            var money_to_admin = {};
            money_to_admin.partial = partial_money_to_admin;
            money_to_admin.complete = all_money_to_admin;
            // Logger.info("the response till now is",money_to_admin,ad_parentlevels_map);
            paramsObj.eligible_users = eligible_users;
            // console.log("the eligibile usr list",paramsObj.eligible_users);
            sendMoneyToUsersAndAdmin(adverts, ad_parentlevels_map, money_to_admin, userIds, paramsObj);
        })
    })
}

  var sendMoneyToUsersAndAdmin = function(adverts, ad_parentlevels_map, money_to_admin, userIds, paramsObj){
    var totalMoneyForAdmin = 0;
    var skip = parseInt(paramsObj.skip);
    var limit = parseInt(paramsObj.limit);
    var total_users = parseInt(paramsObj.total_users);

    async.auto({
      calculateAdminMoney:function(next, result){
        async.forEach(adverts,function(advert,callback1){
          var price_per_click = parseFloat(advert.cost_per_click);
          var price_per_view = parseFloat(advert.cost_per_view);
          var partial_money = 0;
          var impartial_money = price_per_view * money_to_admin.complete[advert.id].length;
          async.forEach(money_to_admin.partial[advert._id],function(percentage,callback2){
            partial_money = partial_money + (price_per_view * percentage/100);
            callback2();
          },function(err2){
            totalMoneyForAdmin = totalMoneyForAdmin + partial_money + impartial_money;
            callback1();
          })
        },function(err1){
          if(skip+limit>=total_users){
            sendMoneyToAdmin(totalMoneyForAdmin, next);
          }else {
            next(null,"pass")
          }
          // sendMoneyToAdmin(totalMoneyForAdmin, next);
        })
      },
      calculateUsersMoney:function(next, result){
        Logger.info("the money_to_admin",totalMoneyForAdmin,skip,total_users);
        if(skip+limit>=total_users){
          calculateUsersEarnedMoney(paramsObj, userIds, next);
        }else {
          next(null,"pass")
        }
      }
    },function(err,results){
      skip = skip+limit;
      if(skip<total_users){
        paramsObj.skip = skip;
        Logger.info("Money Distribution completed for the ",skip," Users Successfully");
        distributeMoneyInBatches(paramsObj);
      }else {
        User_Earning_Buckets_Batch.execute(function(err1,result1){
          if(!err1){
            Logger.info("User Buckets Updated Successfully",result1);
          }else {
            Logger.info("Some error occured in updating User Buckets",err1);
          }
          Users_Batch.execute(function(err2,result2){
            if(!err2){
              Logger.info("User Wallets Updated Successfully",result2);
            }else {
              Logger.info("Some error occured in updating User Wallets",err2);
            }
            Admin_Earning_Details_Batch.execute(function(err3,result3){
              if(!err3){
                Logger.info("Admin Earnings Updated",result3);
              }else {
                Logger.info("Some error occured in updating Admin Earnings",err3);
              }
              Admin_Earning_Bucket_Batch.execute(function(err4,result4){
                if(!err4){
                  Logger.info("Admin Bucket Updated",result4);
                }else {
                  Logger.info("Some error occured in updating Admin Bucket",err4);
                }
                Logger.info("Money Distribution completed for all the Users Successfully");
                resetCache();
              })
            })
          })
        })

      }
    })

  }

  var calculateUsersEarnedMoney = function(paramsObj, userIds, callback){
    var distinct_eligible_viewers = paramsObj.distinct_eligible_viewers;
    var eligible_users = paramsObj.eligible_users;
    // console.log("the eligible list is",Object.keys(eligible_users).length);
    var amount = 0;
    // console.log("inside money upadationnnnn",userIds.length,paramsObj.eligible_users,distinct_eligible_viewers.length);

    async.forEach(Object.keys(eligible_users), function(user_id, pass){
      // Logger.info("the user id is",user_id);
      if(eligible_users[user_id]){
        amount = eligible_users[user_id].earnedMoney;
        // console.log("sending money to user",user_id,amount);
        sendMoneyToUser(user_id, amount, pass)
      }else {
        pass();
      }
    },function(err){
      callback(null,"Users Money Successfully Calculated")
    })
  }

  var sendMoneyToUser = function(user_id, amount, callback){
  var todaydate = new Date();
  // var todaydate = new Date("Mon Dec 21 2016 00:00:00 GMT+0000 (UTC)")
  todaydate.setHours(18, 0, 0, 0);
  Logger.info("sending money to user ",user_id," with amount ",amount);
  if(!isNaN(amount)){
    User_Earning_Buckets_Batch.find({
      user_id:mongoose.Types.ObjectId(user_id.toString()),
      date_of_earning:{
        $gte:todaydate
        // $gte:new Date("Mon Dec 11 2016 18:00:00 GMT+0000 (UTC)"),
        // $lte:new Date("Tue Dec 18 2016 00:00:00 GMT+0000 (UTC)")
      },
      deleted:false
    }).updateOne({
      $inc:{
        total_number_of_earning:1,
        total_amount:amount
      }
    });

    Users_Batch.find({
      _id:mongoose.Types.ObjectId(user_id.toString())
    }).updateOne({
      $inc: {
          "user_account.wallet.wallet_amount_available": amount
      }
    });
  }
  callback();
}

  var sendMoneyToAdmin = function(total_amount, callback){
    var todaydate = new Date();
    // var todaydate = new Date("Mon Dec 21 2016 00:00:00 GMT+0000 (UTC)")
    todaydate.setHours(18, 0, 0, 0);

    if(!isNaN(total_amount)){
      Admin_Earning_Bucket_Batch.find({
        date_of_earning:{
          $gte:todaydate
          // $gte: oneDayPrevious
          // $gte:new Date("Thu Dec 01 2016 18:00:00 GMT+0000 (UTC)"),
          // $lte:new Date("Fri Dec 02 2016 00:00:00 GMT+0000 (UTC)")
        },
        deleted:false
      }).updateOne(
        {
          $inc:{
            total_amount:total_amount,
            total_number_of_earning:1
          }
        })

        Admin_Earning_Details_Batch.find({
          deleted:false
        }).updateOne(
          {
            $inc:{
              total_amount:total_amount,
            }
        })
    }
    callback();
  }

  var resetCache = function(){
    redis_client.flushdb(function(err, rows) {
      if(!err){
        Logger.info("Redis Data Flushed Successfully")
      }else {
        Logger.info("Some error occured in flushing the Redis Cache")
      }
    });
  }

  // distrbuteMoney();
  // resetCache();

})

networkjobApp.listen(3002);
