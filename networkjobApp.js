global.configurationHolder = require('./configurations/DependencyInclude.js')
global.networkjobApp = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
Logger.info("networkjobApp  is run in %s mode", networkjobApp.settings.env);
var sync = require('synchronize')
var CronJob = require('cron').CronJob;
global.neo4jDbConnection = new neo4j(configurationHolder.config.neo4jUrl);
var MongoClient = require('mongodb').MongoClient;
/*
This is cron job run by every day.which is used to:
1.Find the all relationship of nodes.calculate the money of users.
2.Change the status of advertisements.
3.Calculate the charges of the all the clients.
*/

var redis_client = redis.createClient(configurationHolder.config.redisConf);

redis_client.on('connect', function() {
  console.log('Connected to redis master in network job.');
});
var job = new CronJob({
   // cronTime: '00 1 * * * *',
    cronTime: '01 31 18 * * *',
    onTick: function () {
	console.log("job initiated",new Date());
        Logger.info("your network job start running", new Date());
       // getRelationshipBetweenNodes();
       // getAdvertismentStatus();
       // getAllClient();

	// getRelationshipBetweenNodes();
  	getAdvertismentStatus();
  //	getNetworkStatus();
  	getAllClient();
    // distributeSequentially();
    },
    start: true
});
job.start();
/*
This method is used fing the all the client in WeOne.And then it will work async. to find their advertisements.
*/
var getAllClient = function () {
        Logger.info("control in the get all client");
        domain.User.find({
            role: 'ROLE_CLIENT',
            deleted: false
        }, function (err, clientObjects) {
            Logger.info("total number of client", clientObjects.length);
            async.map(clientObjects, getAllAdvertisementOfClient, function (err, result) {
                Logger.info(new Date(), "money of all client calculated successfully");
            });
        });
    }
    /*
    This method is used to get the all advertisements of the particular client and this method run async to calculate the
    charges of the advertisement.
    @clientObject:it contains all the information about the client.
    */
var getAllAdvertisementOfClient = function (clientObject, callback) {
        var clientId = clientObject._id;
        Logger.info("control in the get all advertisement of client");
        var todaydate = new Date();
        // var todaydate = new Date("Tue Sep 15 2016 00:00:00 GMT+0000 (UTC)")
        todaydate.setHours(0, 0, 0, 0);
        Logger.info("today date", todaydate)
        domain.Advert.find({
            "client_details._id": clientId,
            "schedule.end_date": {
                $gte: todaydate
            }
        }, function (err, advertisementObjects) {
            Logger.info(clientId, "total number of advertisement", advertisementObjects.length);
            async.map(advertisementObjects, calculateMoneyOfAdvertismentForClient, function (err, result) {
                Logger.info(clientId, "money of this client calculated successfully");
            });
            callback(null, clientId);
        });
    }
    /*
    It will be used to find the advertisementCharges ie charges on the views and click on count.
    The all clients charges store in domain on day bases.
    @adObject:This contains information about the advertisement
    */
var calculateMoneyOfAdvertismentForClient = function (adObject, callback) {
        var ad_id = adObject._id;
        Logger.info("control in the calculateMoneyOfAdvertismentForClient");
        // var todaydate = new Date("Tue Sep 15 2016 00:00:00 GMT+0000 (UTC)")
        var todaydate = new Date();
        todaydate.setHours(0, 0, 0, 0);
        var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
        Logger.info("ad_id" + oneDayPrevious);
        domain.Ad_View_History.aggregate([{
                $match: {
                    ad_id: mongoose.Types.ObjectId(ad_id),
                    complete_view: true,
                    date: {
                        $gte: oneDayPrevious
                    }
                }
          }, {
                $group: {
                    "_id": "$ad_id",
                    total_client_charge: {
                        $sum: "$client_charged_for_view"
                    },
                    total_number_complete_view: {
                        $sum: 1
                    },
                    client_details: {
                        $first: "$client_details"
                    },
                    view_users: {
                        $addToSet: "$userView._id"
                    }
                }
          }],
            function (err, adViewObjects) {
                Logger.info(err, "add view object", adViewObjects.length);
                var clientChargePerDayObject = {}
                if (adViewObjects.length) {
                    var adViewObject = adViewObjects[0];
                    clientChargePerDayObject.client_details = adViewObject.client_details,
                        clientChargePerDayObject.total_client_charge = adViewObject.total_client_charge
                    clientChargePerDayObject.ad_details = {};
                    clientChargePerDayObject.ad_details.ad_id = adViewObject._id;
                    clientChargePerDayObject.ad_details.total_number_complete_view = adViewObject.total_number_complete_view;
                    clientChargePerDayObject.view_users = adViewObject.view_users
                }
                domain.Ad_Click_History.aggregate([{
                    $match: {
                        ad_id: mongoose.Types.ObjectId(ad_id),
                        date: {
                            $gte: oneDayPrevious
                        }
                    }
          }, {
                    $group: {
                        "_id": "$ad_id",
                        total_client_charge: {
                            $sum: "$client_charged_for_click"
                        },
                        total_number_click: {
                            $sum: 1
                        },
                        click_users: {
                            $addToSet: "$user._id"
                        }
                    }
        }], function (err, adClickObjects) {
                    Logger.info(err, "click on url object", adClickObjects.length);
                    if (adClickObjects.length) {
                        var adClickObject = adClickObjects[0];
                        clientChargePerDayObject.ad_details.total_number_click = adClickObject.total_number_click;
                        clientChargePerDayObject.total_client_charge = clientChargePerDayObject.total_client_charge + adClickObject.total_client_charge;
                        clientChargePerDayObject.click_users = adClickObject.click_users;
                    }
                    if (Object.keys(clientChargePerDayObject).length) {
                        new domain.Client_Charge_Per_Day(clientChargePerDayObject).save(function (err, savedClientCharge) {
                            Logger.info(err, "client charges saved", savedClientCharge.total_client_charge);
                            //client account updated
                            domain.User.findOneAndUpdate({
                                _id: savedClientCharge.client_details._id
                            }, {
                                $inc: {
                                    "client_account.client_charges_available": savedClientCharge.total_client_charge
                                }
                            }, {
                                new: true
                            }, function (err, clientObject) {
                                Logger.info(err, clientObject.name, "client balance", clientObject.client_account.client_charges_available);
                                callback(null, clientObject.name);
                            });
                        });
                    } else {
                        Logger.info("no data of click and view of advertisment");
                    }
                });
            });
    }
    /*
    This method provides the advertisement status ie. ready,schedule,expire etc.It will get all the advertisements which have status schedule and change it into ready by date checking and also change the status of expire advertisements
    */
var getAdvertismentStatus = function () {
        Logger.info("control in the change advertisment status");
        var todaydate = new Date();
        todaydate.setHours(0, 0, 0, 0);
        Logger.info("today date", todaydate)
        var onedayAfter = new Date(todaydate.setDate(todaydate.getDate() + 1));
        domain.Advert.find({
            "schedule.start_date": {
                $lt: onedayAfter
            },
            advert_status: 'schedule',
            deleted: false,
        }, function (err, advertismentObjects) {
            Logger.info("total advertisment of schedule", advertismentObjects.length);
            var objectIds = [];
            for (var i = 0; i < advertismentObjects.length; i++) {
                objectIds.push({
                    _id: advertismentObjects[i]._id,
                    status: 'ready'
                });
            }
            async.map(objectIds, changeAdvertismentStatus, function (err, result) {
                Logger.info("advertisment status updated successfully", "ready");
                domain.Advert.find({
                    "schedule.end_date": {
                       // $lte: new Date().setHours(0, 0, 0, 0)
			$lt: onedayAfter
                    },
                    deleted: false
                }, function (err, advertObjects) {
                    Logger.info("total advertisment of expired", advertObjects.length);
                    var advertIds = [];
                    for (var i = 0; i < advertObjects.length; i++) {
                        advertIds.push({
                            _id: advertObjects[i]._id,
                            status: 'expired'
                        });
                    }
                    async.map(advertIds, changeAdvertismentStatus, function (err, result) {
                        Logger.info("advertisment status updated successfully", "expired");
                    })
                })
            });
        });
    }
    /*it will change the advertisement status of advertisement
    @object:It contains the information about the advertisement*/
var changeAdvertismentStatus = function (object, callback) {
        Logger.info("change advertismentStatus", object);
        domain.Advert.findOneAndUpdate({
            _id: object._id,
            deleted: false
        }, {
            advert_status: object.status
        }, {
            new: true
        }, function (err, updatedAdvertismentObj) {
            if (updatedAdvertismentObj)
                callback(null, "updated sucessfully" + object._id);
            else
                callback(null, "error in updateing" + object._id);
        });
    }
    /*This method is used to find all network-levels upto 10 hirearchy.It will calculate the views of advertisement and then cal the money and then find the network levels.Then ready to distribute the money to upper levels.
     */
var getRelationshipBetweenNodes = function () {
    Logger.info("control in the get getRelationshipBetweenTwoNodes between two nodes");
    domain.MLM.find({
        deleted: false
    }, {
        node_id: 1,
        user_details: 1
    }, function (err, obj) {
        Logger.info("total number of node in MLM", obj.length);
        var nodeIdArray = [];
        for (var i = 0; i < obj.length; i++) {
            var obj1 = {};
            obj1.user_details = obj[i].user_details;
            obj1.node_id = obj[i].node_id;
            nodeIdArray.push(obj1);
        }
        //it will calculate the money of all the user
        var calculateMoney = sync(getViewDetails);
        sync.fiber(function () {
            Logger.info("control in the get money calculation");
            for (var j = 0; j < nodeIdArray.length; j++) {
                Logger.info("money calculation start for user", nodeIdArray[j]);
                calculateMoney(nodeIdArray[j]);
            }
            Logger.info("your work of money calculation is finish ----->", new Date());
            genearteNetworkStatus(nodeIdArray);
            /* async.map(nodeIdArray, genearteNetworkStatus, function (err, result) {
                 if (err) {
                     Logger.info("error in the generate network data");
                     Logger.info(err);
                 }
                 Logger.info("node processing is finish");
                 Logger.info("your work of get network detail is finish ----->", new Date());
             });*/
        });
    });
}



var getNetworkStatus = function () {
    Logger.info("control in the getNetworkStatus manually");
    console.log(neo4jDbConnection)
    if (neo4jDbConnection) {
        domain.MLM.find({
            deleted: false
        }, {
            node_id: 1,
            user_details: 1
        }, function (err, obj) {
            Logger.info("total number of node in MLM", obj.length);
            var nodeIdArray = [];
            for (var i = 0; i < obj.length; i++) {
                var obj1 = {};
                obj1.user_details = obj[i].user_details;
                obj1.node_id = obj[i].node_id;
                nodeIdArray.push(obj1);
            }
            Logger.info("your work for node id is complete", new Date());
            genearteNetworkStatus(nodeIdArray);
            /*       async.map(nodeIdArray, genearteNetworkStatus, function (err, result) {
                       if (err) {
                           Logger.info("error in the generate network data");
                           Logger.info(err);
                       }
                       Logger.info("node processing is finish");
                       Logger.info("your work of get network detail is finish ----->", new Date());
                   });*/
            //});
        });
    } else {
        Logger.info("NO NEO4J CONNECTION")
        Logger.info("APPLICATION DOES't Work ")
    }
}

/*it can calculate the ad views & click count money and also calculate the money of admin commension
@obj:it can conatins information about the user*/
var getViewDetails = function (obj, callback) {
        Logger.info(obj.node_id, "control in the get levels", obj.user_details);
        var node_id = obj.node_id;
        var user_id = obj.user_details;
        neo4jDbConnection.cypherQuery("start Node=node({node_id}) match path=(Node)<-[r:Relationship*1..]-(lastnode) return  path", {
            node_id: node_id
        }, function (err, data) {
            try {
                Logger.info("total number of levels", data.data.length);
                var total_level = data.data.length;
                if (total_level > 10) {
                    total_level = 10;
                }
                var todaydate = new Date();
                Logger.info("today date", todaydate);
                todaydate.setHours(0, 0, 0, 0);
                var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
                Logger.info("oneDayPrevious", oneDayPrevious);
                domain.Ad_View_History.find({
                    "userView._id": user_id,
                    deleted: false,
                    complete_view: true,
                    date: {
                        $gte: oneDayPrevious
		//	$gte:new Date("Tue Aug 16 2016 00:00:00 GMT+0000 (UTC)"),
                //        $lt:new Date("Tue Aug 24 2016 00:00:00 GMT+0000 (UTC)")
                    }
                }, function (err, viewHistroyObject) {
                    Logger.info("total number of video view", viewHistroyObject.length);
                    if (viewHistroyObject.length >= 3) {
                        var total_making_money = 0;
                        for (var i = 0; i < viewHistroyObject.length; i++) {
                            total_making_money = total_making_money + viewHistroyObject[i].client_charged_for_view;
                        }
                        Logger.info("total money of video view", total_making_money);
                        domain.Ad_Click_History.find({
                            "user._id": user_id,
                            deleted: false,
                            date: {
                                $gte: oneDayPrevious
                            }
                        }, function (err, clickhistoryobject) {
                            Logger.info("total number of link cilicked", clickhistoryobject.length);
                            var click_money = 0;
                            for (var j = 0; j < clickhistoryobject.length; j++) {
                                click_money = click_money + clickhistoryobject[i].client_charged_for_click;
                            }
                            Logger.info("total money by click", click_money);
                            total_making_money = total_making_money + click_money;
                            Logger.info("total money", total_making_money);
                            if (viewHistroyObject.length >= 3)
                                createAdmindomain(total_making_money, total_level, node_id, user_id, callback);
                            else {
                                Logger.info("user is not able bcz he saw less video");
                                if (total_making_money)
                                    createAdmindomain(total_making_money, 0, node_id, user_id, callback);
                                else
                                    callback(null, "no money " + node_id, user_id)
                            }
                        });
                    } else {
                        Logger.info("user is not able bcz he saw less video");
                        callback(null, "no money " + node_id, user_id)
                    }
                });
            } catch (e) {
                console.log("Node not found ")
                console.error(e);
                callback(null, "no Money ");
            }
        });
    }
    /*The money of admin will be store in admin domain.
    @total_making_money:this money contains total sum of the money.
    @total_level:this will provide the information about the user levels to upwards.
    @node_id:MLM id of user @user_id:unqiue ref id of user
    */
var createAdmindomain = function (total_making_money, total_level, node_id, user_id, callback) {
        Logger.info("control in the  admin domain");
        domain.Admin_Account_Detail.findOne({
            deleted: false
        }, function (err, admin_acount_object) {
            if (admin_acount_object) {
                calculateAminMoney(admin_acount_object, total_making_money, total_level, node_id, user_id, callback);
            } else {
                Logger.info("create the admin account domain");
                var adminAccObj = new domain.Admin_Account_Detail({});
                adminAccObj.save(function (err, saveAdminAccobj) {
                    calculateAminMoney(saveAdminAccobj, total_making_money, total_level, node_id, user_id, callback);
                });
            }
        });
    }
    /*It will calculate the admin money according to commension of admin money
    @total_making_money:this money contains total sum of the money.
    @total_level:this will provide the information about the user levels to upwards.
    @node_id:MLM id of user @user_id:unqiue ref id of user
    @saveAdminAccObj:It will provides the saved admin object details*/
var calculateAminMoney = function (saveAdminAccobj, total_making_money, total_level, node_id, user_id, callback) {
        Logger.info("control in adminMoney calculation");
        if (total_level != 0) {
            var admin_percentage = saveAdminAccobj.admin_commission;
            var admin_commission = total_making_money * (admin_percentage / 100);
            Logger.info(admin_percentage, "admin percentage", admin_commission, "admin_commission");
            total_making_money = total_making_money - admin_commission;
            total_making_money = (total_making_money / total_level);
            distributeMoneyToUpperUser(admin_commission, total_making_money, total_level, node_id, user_id, callback);
        } else {
            Logger.info("control for top level in mlm")
            ammountAddAdminAcount(total_making_money, user_id, callback)
        }
    }
    /*After cal. of money the reset of money is devided into uper level of the user
    @admin_commission:Money calculation to admin @total_making_money:money to the users
    @total_level:Money devided into how many levels @node_id:MLM id @user_id:unqiue ref id of user
    */
var distributeMoneyToUpperUser = function (admin_commission, total_making_money, total_level, node_id, user_id, callback) {
        Logger.info("control in the distributeMoneyToUpperUser");
        neo4jDbConnection.readIncomingRelationshipsOfNode(node_id, function (err, result) {
            var parent_node = result[0]._start;
            neo4jDbConnection.cypherQuery("match(n:user) where id(n)={parent_node} RETURN n", {
                parent_node: parent_node
            }, function (err, parent_obj) {
                if (err) {
                    Logger.info("error in query", parent_node);
                    Logger.info(err);
                }
                var parent_node_object = parent_obj.data[0];
                var object_id = parent_node_object.objectId;
                var balance = parent_node_object.balance;
                var todaydate = new Date();
                todaydate.setHours(0, 0, 0, 0);
                var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
                domain.Ad_View_History.find({
                    "userView._id": object_id,
                    deleted: false,
                    complete_view: true,
                    date: {
                        $gte: oneDayPrevious
                    }
                }, function (err, viewHistroyObject) {
                    if (viewHistroyObject.length >= 3) {
                        neo4jDbConnection.cypherQuery("match(n:user) where id(n)={parent_node} set n.balance=n.balance+{amount}  RETURN n", {
                            parent_node: parent_node,
                            amount: total_making_money
                        }, function (err, parent_obj) {
                            if (err) {
                                Logger.info("error in the add balance in user");
                                Logger.info(err);
                            }
                            Logger.info(parent_node, "total money in user", parent_obj.data[0].balance);
                            Logger.info("money is add in the user");
                            addTranscationHistroy(object_id, total_making_money);
                            total_level = total_level - 1;
                            if (total_level != 0) {
                                Logger.info("contrl of level ", total_level);
                                distributeMoneyToUpperUser(admin_commission, total_making_money, total_level, parent_node, user_id, callback);
                            } else {
                                ammountAddAdminAcount(admin_commission, user_id, callback);
                            }
                        });
                    } else {
                        Logger.info("user is not able for  add the money");
                        admin_commission = admin_commission + total_making_money;
                        total_level = total_level - 1;
                        if (total_level != 0) {
                            Logger.info("contrl of level ", total_level);
                            distributeMoneyToUpperUser(admin_commission, total_making_money, total_level, parent_node, user_id, callback);
                        } else {
                            ammountAddAdminAcount(admin_commission, user_id, callback);
                        }
                    }
                });
            });
        });
    }
    /*This method add the money of admin account and also maintain the history of admin money calculation
    @admin_commession:Money add to admin wallet
    @user_id:user who credit the money in admin accounts */
var ammountAddAdminAcount = function (admin_commission, user_id, callback) {
        Logger.info("control in the ammount add in admin account", admin_commission);
        domain.Admin_Account_Detail.findOneAndUpdate({
            deleted: false
        }, {
            $inc: {
                total_balance: admin_commission
            },
            $push: {
                earning_details: {
                    date: new Date(),
                    amount: admin_commission,
                    user_id: user_id
                }
            }
        }, {
            new: true
        }, function (err, adminUpdatedObject) {
            if (err) {
                Logger.info("error in update admin money");
                Logger.info(err);
            }
            Logger.info("money is added in admin");
            Logger.info(adminUpdatedObject.total_balance);
            callback(null, adminUpdatedObject.total_balance)
        });
    }
    /*This will be maintain the history of user per day earning.We follow the bucket concept and one the daily basis the history of user is maintain.
    @object_id:user unique id @amount:amount earning per day.
    */
var addTranscationHistroy = function (object_id, amount) {
        Logger.info("control in the add Transcation history");
        // var earningBucketCount = 1000;
        var todaydate = new Date();
        Logger.info("today date", todaydate)
        var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
        Logger.info("oneDayPrevious", oneDayPrevious)
        domain.User_Earning_Bucket.findOne({
            user_id: object_id,
            date_of_earning: {
                $gte: oneDayPrevious
            }
        }, function (err, errningBucketObject) {
            if (errningBucketObject) {
                domain.User_Earning_Bucket.findOneAndUpdate({
                    _id: errningBucketObject._id,
                    deleted: false
                }, {
                    $inc: {
                        total_number_of_earning: 1,
                        total_amount: amount
                    },
                    $push: {
                        earning_details: {
                            amount: amount
                        }
                    }
                }, {
                    new: true
                }, function (err, updatedBucketObject) {
                    domain.User.findOneAndUpdate({
                        _id: object_id,
                        //deleted: false
                    }, {
                        $inc: {
                            "user_account.wallet.wallet_amount_available": amount
                        }
                    }, {
                        new: true
                    }, function (err, updateUser) {
                        if (err) {
                            Logger.info('errror in update user');
                            Logger.info(err);
                        }
                        Logger.info("money is added in the user account and balance", updateUser.user_account.wallet.wallet_amount_available);
                    });
                });
            } else {
                Logger.info("control in the create new bucket");
                var erringBucketObj = new domain.User_Earning_Bucket({
                    user_id: object_id,
                    total_number_of_earning: 1,
                    earning_details: [{
                        amount: amount
                }],
                    total_amount: amount
                });
                erringBucketObj.save(function (err, saveErr) {
                    domain.User.findOneAndUpdate({
                        _id: object_id,
                        deleted: false
                    }, {
                        current_user_earning_bucket: saveErr._id,
                        $push: {
                            user_earning_buckets: saveErr._id
                        },
                        $inc: {
                            "user_account.wallet.wallet_amount_available": amount
                        }
                    }, {
                        new: true
                    }, function (err, updateUser) {
                        if (err) {
                            Logger.info('errror in update user');
                            Logger.info(err);
                        }
                        Logger.info("money is added in the user account and balance", updateUser.user_earning_till_date);
                    });
                });
            }
        });
    }
    /*it will create the user network domain and provide data to calculated money with levels  of user store in the domain
    @obj:information about the all level money calculationsss.*/
var genearteNetworkStatus = function (nodeIdArray) {
        //it will generate the query array
        var queryarray = generateThequeryArray();
        var obj = nodeIdArray.pop();
        var node_id = obj.node_id;
        var user_id = obj.user_details;
        var User_Network_detailsObj = new domain.User_Network_details({
            user_id: user_id,
            neo4j_node_id: node_id
        });
        User_Network_detailsObj.save(function (err, user_network_saveObject) {
            //it will set the value of node globelly
            getDataFromBottomLevel.node_id = node_id;
            getDataFromBottomLevel.user_network_id = user_network_saveObject._id;
            async.map(queryarray, getDataFromBottomLevel.Neo4jqueryfunction.bind(getDataFromBottomLevel), function (err, result) {
                if (err) {
                    Logger.info("error in the async map");
                    Logger.info(err);
                }
                Logger.info("final result", node_id, "completed");
                if (nodeIdArray.length != 0)
                    genearteNetworkStatus(nodeIdArray);
            });
        });
    }
    //it will save the all Network status of all the user
var getDataFromBottomLevel = {
        Neo4jqueryfunction: function (object, callback) {
            Logger.info(object.level, this.node_id, this.user_network_id);
            var node_id = this.node_id
            var user_network_id = this.user_network_id;
            neo4jDbConnection.cypherQuery(object.mainquery + object.level, {
                node_id: node_id
            }, function (err, obj) {
                if (err) {
                    Logger.info("error in cypher query");
                    Logger.info(err);
                }
                if (obj) {
                    if (obj.data != '') {
                        var levelobject = {};
                        levelobject.level_name = object.level;
                        levelobject.person_count = obj.data.length;
                        levelobject.person_object_id = [];
                        for (var i = 0; i < levelobject.person_count; i++) {
                            levelobject.person_object_id.push({
                                object_id: obj.data[i].objectId,
                                name: obj.data[i].name,
                                balance: obj.data[i].balance
                            });
                        }
                        domain.User_Network_details.findOneAndUpdate({
                            _id: user_network_id,
                            deleted: false
                        }, {
                            $inc: {
                                number_of_levels: 1
                            },
                            $push: {
                                levels: levelobject
                            }
                        }, {
                            new: true
                        }, function (err, networkobj) {
                            callback(null, obj);
                        });
                    } else {
                        //Logger.info(obj);
                        callback(null, obj);
                    }
                } else {
                    callback(null, obj);
                }
            });
        }
    }
    /* This is MLM queries find the data upto 10 levels
    @queryarray:it will return the the query upto level 10.
    */
var generateThequeryArray = function () {
        var level0query = "Match(Level0:user) where id(Level0)={node_id}"
        var level1query = level0query + "Match(Level0)-[R1:Relationship]->(Level1)";
        var level2query = level1query + "-[R2:Relationship]->(Level2)";
        var level3query = level2query + "-[R3:Relationship]->(Level3)";
        var level4query = level3query + "-[R4:Relationship]->(Level4)";
        var level5query = level4query + "-[R5:Relationship]->(Level5)";
        var level6query = level5query + "-[R6:Relationship]->(Level6)";
        var level7query = level6query + "-[R7:Relationship]->(Level7)";
        var level8query = level7query + "-[R8:Relationship]->(Level8)";
        var level9query = level8query + "-[R9:Relationship]->(Level9)";
        var level10query = level9query + "-[R10:Relationship]->(Level10)";
        var queryreturn = " return ";
        var queryarray = [{
            mainquery: level0query + queryreturn,
            level: "Level0"
        }, {
            mainquery: level1query + queryreturn,
            level: "Level1"
        }, {
            mainquery: level2query + queryreturn,
            level: "Level2"
        }, {
            mainquery: level3query + queryreturn,
            level: "Level3"
        }, {
            mainquery: level4query + queryreturn,
            level: "Level4"
        }, {
            mainquery: level5query + queryreturn,
            level: "Level5"
        }, {
            mainquery: level6query + queryreturn,
            level: "Level6"
        }, {
            mainquery: level7query + queryreturn,
            level: "Level7"
        }, {
            mainquery: level8query + queryreturn,
            level: "Level8"
        }, {
            mainquery: level9query + queryreturn,
            level: "Level9"
        }, {
            mainquery: level10query + queryreturn,
            level: "Level10"
        }];

        return queryarray;
    }


var options = {server: {socketOptions: {connectTimeoutMS: 600000,keepAlive:300000}},replSet: {},mongos: {},auto_reconnect: true,poolSize: 500};
// MongoClient.connect("mongodb://admin:admin@localhost:27017/Weone",options, function(err, db) {  //FOR STAGING and LOCAL
MongoClient.connect("mongodb://admin:admin@10.10.50.130:27017/Weone",options, function(err, db) { //FOR PRODUCTION SERVER
  var job = new CronJob({
      // cronTime: '00 1 19 * * *',
      cronTime: '01 00 19 * * *',
      onTick: function () {
  	      console.log("job initiated",new Date());
          Logger.info("your network job start running", new Date());
          // distributeSequentially();
      },
      start: true
  });
  job.start();

    var User_Earning_Buckets = db.collection('userearningbuckets');
    var Users = db.collection('users');
    var User_Network_Detailsv2 = db.collection('user_network_detailsv2');

    var Admin_Earning_Details = db.collection('admin_earning_details');
    var Admin_Earning_Bucket = db.collection('admin_earning_buckets');

    var User_Earning_Buckets_Batch = User_Earning_Buckets.initializeOrderedBulkOp();    //User_Earning_Buckets.initializeOrderedBulkOp();
    var Users_Batch = Users.initializeOrderedBulkOp();
    var User_Network_Detailsv2_Batch = User_Network_Detailsv2.initializeOrderedBulkOp();

    var Admin_Earning_Details_Batch = Admin_Earning_Details.initializeOrderedBulkOp();
    var Admin_Earning_Bucket_Batch = Admin_Earning_Bucket.initializeOrderedBulkOp();

    var distributeSequentially = function(){
      var todaydate = new Date();
      todaydate.setHours(0, 0, 0, 0);
      var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
      var onedayAfter = new Date(todaydate.setDate(todaydate.getDate() + 1));
      domain.Advert.find({
           "schedule.start_date":{$lt:todaydate,$gt:oneDayPrevious},    //DATE CONDN ON SERVER
          // "schedule.end_date":{$gt:new Date("Tue Oct 16 2016 00:00:00 GMT+0000 (UTC)"),$lt:new Date("Tue Oct 17 2016 00:00:00 GMT+0000 (UTC)")},   //ON LOCAL
          // "schedule.end_date":{$gt:new Date("Mon Dec 12 2016 00:00:00 GMT+0000 (UTC)"),$lt:new Date("Tue Dec 13 2016 00:00:00 GMT+0000 (UTC)")},   //ON LOCAL
          // "schedule.end_date":{$gt:new Date("Tue Sep 14 2016 00:00:00 GMT+0000 (UTC)"),$lt:new Date("Tue Sep 15 2016 00:00:00 GMT+0000 (UTC)")},  // ON STAGING
          deleted: false
      }, function (err, adverts) {
          Logger.info("total ads are",adverts.length);
          var advert_ids = adverts.map(function(advert){
  		      console.log("the ads are",advert.name_of_advert);
            return advert._id;
          })
         // Logger.info("the advert_ids",advert_ids);
         domain.Ad_View_History.distinct('userView._id',{ad_id:{$in:advert_ids},complete_view: true},function(err,users){
           domain.MLMv2.find({user_details:{$in:users}},{node_id:1,parent_node:1,user_details:1},function(err,mlmUsers){
             if(!err){
               var child_to_parent_map = {};
              //  child_to_parent_map[187] = {parent_node:0,user_id:mlmUser.user_details};
               async.forEach(mlmUsers,function(mlmUser,passOn){
                 child_to_parent_map[mlmUser.node_id] = {parent_node:mlmUser.parent_node,user_id:mlmUser.user_details};
                 passOn();
               },function(err){
                   if(!err){
                    //  domain.Ad_View_History.distinct('userView._id',{ad_id:{$in:advert_ids},complete_view: true},function(err,users){
                    //  )}
                    Logger.info("Total users are",users.length);
                    // if(users.length==0){
                    if(users.length>0){
                      var skip = 0;
                      var limit = 1;
                      var counter = 0;
                      var User_Earning_Buckets_Save_Batch = User_Earning_Buckets.initializeUnorderedBulkOp();
                      async.forEach(users, function(user, localCallback){
                        var earningObject = {};
                        earningObject.createdAt = new Date();
                        earningObject.updatedAt = new Date();
                        earningObject.deletedAt = null
                        earningObject.deleted = false
                        earningObject.user_id= user;
                        earningObject.total_amount=0;
                        earningObject.date_of_earning= new Date();
                        // earningObject.date_of_earning= new Date("Tue Dec 13 2016 18:00:00 GMT+0000 (UTC)")
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
                                  console.log("creating the admin earning bucket");
                                  var admin_earning_obj = {};
                                  admin_earning_obj.admin_id = res._id;
                                  admin_earning_obj.date_of_earning = new Date();
                                  // admin_earning_obj.date_of_earning = new Date("Tue Oct 16 2016 19:00:00 GMT+0000 (UTC)");
                                  var adminSave = new domain.Admin_Earning_Bucket(admin_earning_obj);
                                  adminSave.save(function(err,resSave){
                                    // console.log("the resp s",err,resSave._id);
                                    domain.Admin_Earning_Details.update({deleted:false},
                                      {$push:{buckets:resSave._id},
                                      $inc:{bucket_count:1}},
                                      function(err,result){
                                        recursiveDistribution(skip,limit,counter,advert_ids, users, users.length, child_to_parent_map)
                                    });
                                  })
                                })
                              }else {
                                console.log("not creating the admin earning bucket");
                                recursiveDistribution(skip,limit,counter,advert_ids, users, users.length, child_to_parent_map)
                              }
                            })
                          }else {
                            console.log("the res is",err);
                          }
                        })
                      })
                    }
                  }
               })
             }else {

             }
           })
         })

    })
  }


    var recursiveDistribution = function(skip, limit, counter, advert_ids, users, length, child_to_parent_map){
      Logger.info("Users left",length - skip)
      async.auto({
        step1:function(next, results){
          counter = skip + limit;
          distributeMoney(skip, limit, advert_ids, users, child_to_parent_map, next);
        }
      },function(err, results){
        if(counter<length){
          skip = skip + limit;
          // Logger.info("Next iteration starting",skip,skip+limit);
          // if(counter%100 == 0){
          //   console.log("Updating the Money for users");
          //   User_Earning_Buckets_Batch.execute(function(err,resUserEarning){
          //     console.log("User Earnings Updated",err,resUserEarning);
          //   });

          // User_Earning_Buckets_Batch.execute(function(err,resUsers){
          //     console.log("Users Earnings Updated",err,resUsers);
          //     Admin_Account_Details_Batch.execute(function(err,resAdmin){
          //       console.log("Admin Earnings Updated",err,resAdmin);
          //       Users_Batch.execute(function(err,resUserEarning){
          //         console.log("Users Wallet Updated",err,resUserEarning);
          //         // db.close();
                  recursiveDistribution(skip,limit,counter, advert_ids, users, length, child_to_parent_map);
          //       });
          //     });
          //   });
          // }else {
          //   recursiveDistribution(skip,limit,counter, advert_ids, users, length, child_to_parent_map);
          // }
        }else {

          var todaydate = new Date();
          todaydate.setHours(19, 0, 0, 0);
          var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));

          console.log("Updating the Money");

          // User_Earning_Buckets_Batch.execute(function(err,results){
          //   console.log("User Earnings Updated");
          //   Admin_Earning_Bucket_Batch.execute(function(err,result){
          //     console.log("Admin Earnings Updated");
          //
          //   })
          // })
          User_Earning_Buckets_Batch.execute(function(err,result){
            console.log("Admin Earning Details Updated",err,result);
            Admin_Earning_Bucket_Batch.execute(function(err,result){
              console.log("Admin Bucket Updated",err,result);
              Users_Batch.execute(function(err,result){
                console.log("Users Wallet Updated",err,result);
                Admin_Earning_Details_Batch.execute(function(err,resUserEarning){
                console.log("User Earnings Updated",err,resUserEarning);
                console.log("Money Distribution Completed");
		demo_fn();
                // setTimeout(function () {
                //   domain.User_Earning_Bucket.remove({total_amount:0},function(err,res){
                //         updateTheNetworkTree(users);
                //   });
                // }, 600000)
                // domain.User_Earning_Bucket.remove({total_amount:0},function(err,res){
                  domain.User_Earning_Bucket.find(
                    {total_amount:{$ne:0},
                    date_of_earning:{
                      $gte:todaydate
                      // $gte:new Date("Tue Oct 16 2016 19:00:00 GMT+0000 (UTC)"),
                      // $lte:new Date("Tue Oct 17 2016 00:00:00 GMT+0000 (UTC)")
                    }},
                    function(err,buckets){
                      var updatedUsers = buckets.map(function(bucket){
                        return bucket.user_id;
                      })
                      // console.log("the no of users are",buckets.length);
                      // updateTheNetworkTree(users);
                  })
                // });

              });
              })

              })
            });


          // Users_Batch.execute(function(err,resUsers){
          //   console.log("Users Wallet Updated",err,resUsers);
          //   setTimeout(function () {
          //     console.log('3')
          //     Admin_Account_Details_Batch.execute(function(err,resAdmin){
          //       console.log("Admin Earnings Updated",err,resAdmin);
          //       setTimeout(function () {
          //         console.log('3')
                //   User_Earning_Buckets_Batch.execute(function(err,resUserEarning){
                //   console.log("User Earnings Updated",err,resUserEarning);
                // });
          //     }, 3000)
          //     });
          //   }, 3000)
          //
          // });
        }
      })
    }

    var distributeMoney = function(skip, limit, advert_ids, users, child_to_parent_map, superCallback){

      // Logger.info("the total users are",users.length,skip,limit);
      var lim = limit+skip;
      // console.log("user is",users[skip],users[skip+1]);
      for(var i=skip;i<lim;i++){
        // console.log("IIIIIIIIIIIIIIIIII::",i,"LIMIT",limit);
        var userId = users[i];
        domain.Ad_View_History.find({
          'userView._id':userId,
          ad_id:{$in:advert_ids},
          complete_view: true,
        },function(errView,advertViews){
          // Logger.info("total ad views are",advertViews.length);
            var totalMoneyEarned = 0;

            if(advertViews.length>0){
              async.forEach(advertViews, function(view, callback){
                totalMoneyEarned = totalMoneyEarned + view.client_charged_for_view;
                callback();
              },function(err){
                domain.Ad_Click_History.find({
                    "user._id": userId,
                    deleted: false,
                    ad_id:{$in:advert_ids}
                }, function (err, advertClicks) {
                    async.forEach(advertClicks, function(click, pass){
                      totalMoneyEarned = totalMoneyEarned + click.client_charged_for_click;
                      pass();
                    },function(err){
                      if(advertViews.length>=3){
                        //distributing the money amongst the users and admin
                        // Logger.info("Views are greater than 3, sending money to user and admin");
                        distributeMoneyToAll(userId, totalMoneyEarned, advert_ids,i,skip+limit, child_to_parent_map, superCallback);
                      }else {
                        //sending money only to the admin
                        // Logger.info("Views are less than 3, sending money to admin",totalMoneyEarned);
                        var isFinal = true;
                        // amtForAdmin, null, counter, level, i, limit, isFinal, superCallback
                        sendMoneyToAdmin(totalMoneyEarned,userId,0,0,i,skip+limit, isFinal,child_to_parent_map, superCallback);

                      }
                    })
                });
              })
            }else {
              Logger.info("NO AD Views");
            }

        })
      }
    }

    var distributeMoneyToAll = function(user_id, totalMoney, advert_ids, i, limit, child_to_parent_map, superCallback){
      // console.log("Inside distributeMoneyToAll ");
      domain.User.findOne({_id:user_id},function(err,user){
        if(!err && user){
          var node_id = parseInt(user.neo4J_node_id);

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

          neo4jDbConnection.cypherQuery("start Node=node({node_id}) match path=(Node)<-[r:Relationship*1..]-(lastnode) return  path",
            {node_id: node_id},
            function(err, result){
              if(!err && result){
                  // console.log("the node is ",node_id,err,result);
                  // Logger.info("the result is",result.data.length,node_id,user_id);
                  var level = 0;
                  if(result.data.length>11){
                    level = 11;
                  }else {
                    level = result.data.length;
                  }
                  var counter = 0;
                  var currentUserNeoId = parseInt(user.neo4J_node_id);
                  var totalMoneyForAdmin = totalMoney;
                  // Logger.info("Going inside the recursive fn path length is", node_id, result.data.length);
                  distributeRecursively(level, currentUserNeoId, totalMoney, moneyPercentagePerLevelMap, counter, totalMoneyForAdmin, user._id, advert_ids, true, i, limit, child_to_parent_map, superCallback);
              }else {
                superCallback(null,{});
              }
          })
        }else {
          superCallback(null,{});
        }
      })
    }

    var sendMoneyToAdmin = function(totalMoneyEarned,user_id, counter, level, i, limit, isFinal, child_to_parent_map, superCallback){
      // console.log("the money is going to be addded in admin's accnt",totalMoneyEarned,user_id,i,limit,level,counter);
      var todaydate = new Date();
      //  var todaydate = new Date("Tue Sep 15 2016 00:00:00 GMT+0000 (UTC)");//new Date();

      todaydate.setHours(19, 0, 0, 0);
      // var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));

      if(user_id && !isNaN(totalMoneyEarned)){
        Admin_Earning_Bucket_Batch.find({
          date_of_earning:{
            $gte:todaydate
            // $gte: oneDayPrevious
            // $gte:new Date("Tue Oct 16 2016 19:00:00 GMT+0000 (UTC)"),
            // $lte:new Date("Tue Oct 17 2016 00:00:00 GMT+0000 (UTC)")
          },
          deleted:false
        }).updateOne(
          {
            $inc:{
              total_amount:totalMoneyEarned,
              total_number_of_earning:1
            },
            $push:{
              earning_details:{
                amount:totalMoneyEarned,
                user_id:user_id
              }
            }
          })


          Admin_Earning_Details_Batch.find({
            deleted:false
          }).updateOne(
            {
              $inc:{
                total_amount:totalMoneyEarned,
              }
          })

        // Admin_Account_Details_Batch.find({deleted:false}).updateOne(
        //   {
        //     $inc:{
        //       total_balance:totalMoneyEarned
        //     },
        //     $push:{
        //       earning_details:{
        //         date: new Date(),
        //         amount:totalMoneyEarned,
        //         user_id:user_id
        //       }
        //     }
        //   })

      }
   if(isFinal){
     if(i==limit){
      //  Logger.info("SENDING CALLBACK",counter, level, i, limit, isFinal);
       superCallback(null, {})
     }
   }
    }

    var sendMoneyToUser = function(node_id,total_money,percentage, counter, level, i ,limit, child_to_parent_map, superCallback){
      // console.log("Inside send money to user",node_id,total_money,percentage);
      var node_id = node_id.toString();
      var todaydate = new Date();
      //  var todaydate = new Date("Tue Sep 15 2016 00:00:00 GMT+0000 (UTC)");//new Date();

      todaydate.setHours(19, 0, 0, 0);
      // var oneDayPrevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
      var amount = (total_money * percentage/100);
      // console.log("the money received by user is",amount,node_id);
      neo4jDbConnection.cypherQuery("match(n:user) where id(n)={node_id} set n.balance=n.balance+{amount}  RETURN n", {
          node_id: parseInt(node_id),
          amount: amount
      }, function (err, neoUpdate) {
          // Logger.info("The user is updated in the neo4j",node_id,amount);
      });

      if(child_to_parent_map[parseInt(node_id)]){
        if(child_to_parent_map[parseInt(node_id)].user_id){

          // domain.User_Earning_Bucket.update({
          //   user_id:child_to_parent_map[parseInt(node_id)].user_id,
          //   date_of_earning:{
          //     $gte: oneDayPrevious
          //   },
          //   deleted:false
          // },{$inc:{
          //   total_number_of_earning:1,
          //   total_amount:amount
          // },
          // $push:{
          //   earning_details:{
          //     amount:amount
          //   }
          // }},function(error,response){
          //   // Logger.info("the response of earning is",error,response);
          // });


          // console.log("the user id is",mongoose.Types.ObjectId(child_to_parent_map[parseInt(node_id)].user_id.toString()),amount);
          if(!isNaN(amount)){
          User_Earning_Buckets_Batch.find({
            user_id:mongoose.Types.ObjectId(child_to_parent_map[parseInt(node_id)].user_id.toString()),
            date_of_earning:{
              $gte:todaydate
              //$gte: oneDayPrevious
              // $gte:new Date("Tue Dec 13 2016 17:00:00 GMT+0000 (UTC)"),
              // $lte:new Date("Wed Dec 14 2016 00:00:00 GMT+0000 (UTC)")
            },
            deleted:false
          }).updateOne({
            $inc:{
              total_number_of_earning:1,
              total_amount:amount
            },
            $push:{
              earning_details:{
                amount:amount
              }
            }
          });
        }
        }
      }


      if(!isNaN(amount)){
        Users_Batch.find({
          neo4J_node_id:node_id
        }).updateOne({
          $inc: {
              "user_account.wallet.wallet_amount_available": amount
          }
        });
      }

    }

    var distributeRecursively = function(level, currentUserNeoId, totalMoney, moneyPercentagePerLevelMap, counter, totalMoneyForAdmin,user_id, advert_ids, isViewedFlag, i, limit, child_to_parent_map, superCallback){
      // Logger.info("params are",level, counter,currentUserNeoId, moneyPercentagePerLevelMap[counter],  totalMoneyForAdmin);
      if(counter<level || level==0){
        if(level==0){
          level=100;
        }
        if(isViewedFlag){
          sendMoneyToUser(currentUserNeoId,totalMoney,moneyPercentagePerLevelMap[counter], counter, level, i, limit, child_to_parent_map, superCallback);
        }else {
          // Logger.info("The current users views are <3, sending money to admin",currentUserNeoId);
          var amtForAdmin = (totalMoney * moneyPercentagePerLevelMap[counter])/100;
          var isFinal = false;
          sendMoneyToAdmin(amtForAdmin, user_id, counter, level, i, limit, isFinal, child_to_parent_map, superCallback);
        }
        totalMoneyForAdmin = (totalMoneyForAdmin - (totalMoney*moneyPercentagePerLevelMap[counter]/100));          //(totalMoney - (totalMoney*moneyPercentagePerLevelMap[counter]/100));
        counter++;
        domain.User.findOne(
          {neo4J_node_id:currentUserNeoId.toString()},
          {neo4J_node_id:1,inviter:1}).populate({path: 'inviter', select: 'neo4J_node_id'}).exec(function(err,res){

          if(res){
            if(res.inviter){
              // console.log("the inviter res is 1 ",res._id);
              // console.log("the inviter res is 2 ",res.inviter._id);
              currentUserNeoId = parseInt(res.inviter.neo4J_node_id);
              user_id = res.inviter._id;
              domain.Ad_View_History.find({
                'userView._id':user_id,
                ad_id:{$in:advert_ids},
                complete_view: true,
              },function(errView,adverts){
                  if(!errView && adverts){
                    if(adverts.length>=3){
                      isViewedFlag = true;
                    }else {
                      isViewedFlag = false;
                    }
                  }else {
                    isViewedFlag = false;
                  }
                  // console.log("Sending level",level);
                  distributeRecursively(level, currentUserNeoId, totalMoney, moneyPercentagePerLevelMap, counter, totalMoneyForAdmin, user_id, advert_ids, isViewedFlag, i, limit, child_to_parent_map, superCallback);
              })
            }else {
              superCallback();
            }
          }else {
            superCallback();
          }
        })
      }else {
        counter++;
        // Logger.info("Sending money to admin",totalMoneyForAdmin);
        var isFinal = true;
        sendMoneyToAdmin(totalMoneyForAdmin, user_id, counter, level, i, limit, isFinal, child_to_parent_map, superCallback);
      }
    }

    var updateTheNetworkTree = function(users){
      // Logger.info("the users are",users.length);
      domain.User.find({_id:{$in:users}},{neo4J_node_id:1,phonenumber:1,'user_account.wallet.wallet_amount_available':1},
      function(err,usersObj){
      var counter = 0;
      updateInTheNetworkTree(usersObj[0], usersObj[0].user_account.wallet.wallet_amount_available, usersObj, counter)
      })
    }

    var updateInTheNetworkTree = function(user, updated_amount, users, counter){

      if(counter<users.length){
        counter++;
        Logger.info("Left USers",users.length - counter);
        var node_id = parseInt(user.neo4J_node_id);
        var phonenumber = user.phonenumber;
        domain.User_Network_Detailsv2.find(
          {
            'levels.persons.phonenumber':phonenumber
          },
          {
            'levels.$':1
          },function(err,networks){
            if(!err){
              // console.log("1",networks.length);
              networks.forEach(function(network){
                var level_number = 0;
                // console.log("2",network.levels.length);
                network.levels.forEach(function(level){
                  var person_number = 0;
                  // console.log("3",level.persons.length);
                  level.persons.forEach(function(person){
                    // console.log("the person number is",person_number);
                    var levelNo = parseInt(level.level_name.substr(6,level.level_name.length));
                    if(person){
                      if(person.phonenumber==phonenumber){
                        var setter = {};
                        // setter["levels."+level_number+".persons."+person_number+".total_balance"] = updated_amount;
                        setter["levels."+levelNo+".persons."+person_number+".total_balance"] = Math.round(updated_amount * 100) / 100;
                        person_number++;
                        User_Network_Detailsv2_Batch.find(
                          {
                            _id:network._id,
                            'levels.level_name':level.level_name,
                            'levels.persons.phonenumber':user.phonenumber
                          }).updateOne(
                            {
                              $set:setter
                            }
                          );

                        // console.log("Updated Successfully");
                      }else {
                        person_number++;
                      }
                    }else {
                      person_number++;
                    }

                  })
                  level_number++;
                })
              })
              if(counter<users.length){
                updateInTheNetworkTree(users[counter], users[counter].user_account.wallet.wallet_amount_available, users, counter)
              }else {
                console.log("Updating the Network Tree");
                User_Network_Detailsv2_Batch.execute(function(err,res){
                  if(!err){
                    console.log("Money Distribution Completed",err,res);
                    domain.User_Earning_Bucket.remove({total_amount:0},function(err,res){
                      Logger.info("Money Distribution Completed")
                    });
                  }
                })
              }
            }else {
              if(counter<users.length){
                updateInTheNetworkTree(users[counter], users[counter].user_account.wallet.wallet_amount_available, users, counter)
              }else {
                console.log("Updating the Network Tree");
                User_Network_Detailsv2_Batch.execute(function(err,res){
                  if(!err){
                    console.log("Money Distribution Completed",err,res);
                    domain.User_Earning_Bucket.remove({total_amount:0},function(err,res){
                      Logger.info("Money Distribution Completed")
                    });

                  }
                })
              }
            }
          }
        )
      }else {
        console.log("Updating the Network Tree");
        User_Network_Detailsv2_Batch.execute(function(err,res){
          if(!err){
            console.log("Money Distribution Completed",err,res);
            domain.User_Earning_Bucket.remove({total_amount:0},function(err,res){
              Logger.info("Money Distribution Completed")
            });

          }
        })
      }

    }

    var demo_fn = function(){

	redis_client.flushdb(function(err, rows) {
      if(!err){
        Logger.info("Redis Data Flushed Successfully")
      }else {
        Logger.info("Some error occured in flushing the Redis Cache")
      }
    });
    }

//    demo_fn();
  //  distributeSequentially();
});
      // distributeSequentially();
    //  demo_fn();
    // getRelationshipBetweenNodes();
    //	getAdvertismentStatus();   //for ads manually
    // getNetworkStatus();
    //getAllClient();     //for networkjob manually
    //distributeMoney();
networkjobApp.listen(3002);
