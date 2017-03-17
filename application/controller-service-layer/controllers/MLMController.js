/* @author Himanshu Goyal
This is just only for testing purpose the main code not use it
*/

/*  "/api/v1/createUserNode": [{
	            method: "POST",
	            action: controllers.userController.createUserNode,
	            middleware: [],
	            views: {
	                json: views.jsonView
	            }
            }],
	        "/api/v1/userNode/:id": [{
	                method: "GET",
	                action: controllers.userController.getUserNode,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
				},
	            {
	                method: "put",
	                action: controllers.userController.updateUserNode,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
				},
	            {
	                method: "delete",
	                action: controllers.userController.removeUserNode,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
				}
			],
	        "/api/v1/UserRelation/:id1/:id2": [{
	            method: "GET",
	            action: controllers.userController.createRelationshipWithTwoNodes,
	            middleware: [],
	            views: {
	                json: views.jsonView
	            }
            }],*/


var SetResponse = require('../services/SetResponseService');
module.exports = function () {

    var getNotification = function (req, res, callback) {
        //Logger.info("control in the get notification");
        var message = new gcm.Message();
        message.addData("key1", "hello notification");
        sender.send(message, {
            registrationTokens: ['APA91bFRESsGi75NYOq4HnSg4SVLjNze50FG9X8Y9VPcmMGwqRzCrDIpthp3mnXd4ZrLaeYy04qx0UFtH_JpbnQwBlJi_KLq6ci8tuznRNkjjgTIlZLeyibd4xHKmSIyDHf8-ha-1VCH']
        }, function (err, response) {
            if (err){

            }
                //Logger.info("error", err);
            else{

            }
                //Logger.info("response");
            //Logger.info(response)
        });
    }

    var getRewards = function (req, res, callback) {
        //Logger.info("control in the get rewards ");
        var user_id = "56c824dc891f32101aad8ce4";
        var todaydate = new Date();
        //Logger.info("today date", todaydate)
        var onedayprevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
        //Logger.info("onedayprevious", onedayprevious)
        domain.User_Earning_Bucket.findOne({
            user_id: user_id,
            date_of_earning: {
                $gte: onedayprevious
            },
            paystatus: false
        }).populate("user_id", "gender age").exec(function (err, obj) {
            //Logger.info("earning object");
            if (obj) {
                var userdetail = {
                    user_id: obj.user_id._id,
                    age: obj.user_id.age,
                    gender: obj.user_id.gender
                }
                MasterRewardObject = domain.Master_Reward({
                    name: "Earning Reward",
                    text_to_display: "MLM earning ",
                    type: 'normal',
                    cash_amount: obj.total_amount,
                    user_details: userdetail
                });
                MasterRewardObject.save(function (err, savedObject) {
                    //Logger.info(err);
                    //Logger.info("object saved succesfully");

                });
            } else {
                //Logger.info("no need to reward");
            }

        });
    };

    var getLevls = function (req, res, callback) {
        //Logger.info("control in the get levels");
        var node_id = 60;
        var user_id = "56c45ea7727f6b192b467af1";
        neo4jDbConnection.cypherQuery("start Node=node({node_id}) match path=Node<-[r:Relationship*1..]-lastnode return  path", {
            node_id: node_id
        }, function (err, data) {
            //Logger.info("total number of levels", data.data.length);
            var total_level = data.data.length;
            if (total_level > 10) {
                total_level = 10;
            }
            var todaydate = new Date();
            //Logger.info("today date", todaydate)
            var onedayprevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
            //Logger.info("onedayprevious", onedayprevious)
            domain.Ad_View_History.find({
                "userView._id": user_id,
                deleted: false,
                complete_view: true,
                date: {
                    $gte: onedayprevious
                }
            }, function (err, viewHistroyObject) {
                //Logger.info("total number of video view", viewHistroyObject.length);
                if (viewHistroyObject.length >= 3) {
                    var total_making_money = 0;
                    for (var i = 0; i < viewHistroyObject.length; i++) {
                        total_making_money = total_making_money + viewHistroyObject[i].client_charged_for_view;
                    }
                    //Logger.info("total money of video view", total_making_money);
                    domain.Ad_Click_History.find({
                        "user._id": user_id,
                        deleted: false,
                        date: {
                            $gte: onedayprevious
                        }
                    }, function (err, clickhistoryobject) {
                        //Logger.info("total number of link cilicked", clickhistoryobject.length);
                        var click_money = 0;
                        for (var j = 0; j < clickhistoryobject.length; j++) {
                            click_money = click_money + clickhistoryobject[i].client_charged_for_click;
                        }
                        //Logger.info("total money by click", click_money);
                        total_making_money = total_making_money + click_money;
                        //Logger.info("total money", total_making_money);
                        createAdmindomain(total_making_money, total_level, node_id, user_id);
                    });
                } else {
                    //Logger.info("user is not able bcz he saw less video");
                }
            });
        });
    }

    var createAdmindomain = function (total_making_money, total_level, node_id, user_id) {
        //Logger.info("control in the  admin domain");
        domain.Admin_Account_Detail.findOne({
            deleted: false
        }, function (err, admin_acount_object) {
            if (admin_acount_object) {
                calculateAminMoney(admin_acount_object, total_making_money, total_level, node_id, user_id);
            } else {
                //Logger.info("create the admin account domain");
                var adminAccObj = new domain.Admin_Account_Detail({});
                adminAccObj.save(function (err, saveAdminAccobj) {
                    calculateAminMoney(saveAdminAccobj, total_making_money, total_level, node_id, user_id);
                });
            }
        });
    }

    var calculateAminMoney = function (saveAdminAccobj, total_making_money, total_level, node_id, user_id) {
        //Logger.info("control in adminMoney calculation");
        if (total_level != 0) {
            var admin_percentage = saveAdminAccobj.admin_commission;
            var admin_commission = total_making_money * (admin_percentage / 100);
            //Logger.info(admin_percentage, "admin percentage", admin_commission, "admin_commission");
            total_making_money = total_making_money - admin_commission;
            total_making_money = (total_making_money / total_level);
            distributeMoneyToUpperUser(admin_commission, total_making_money, total_level, node_id, user_id);
        } else {
            //Logger.info("control for top level in mlm")
            ammountAddAdminAcount(total_making_money, user_id)
        }
    }

    var distributeMoneyToUpperUser = function (admin_commission, total_making_money, total_level, node_id, user_id) {
        //Logger.info("control in the distributeMoneyToUpperUser");

        neo4jDbConnection.readIncomingRelationshipsOfNode(node_id, function (err, result) {
            var parent_node = result[0]._start;
            neo4jDbConnection.cypherQuery("match(n:user) where id(n)={parent_node} RETURN n", {
                parent_node: parent_node
            }, function (err, parent_obj) {
                if (err) {
                    //Logger.info("error in query", parent_node);
                    //Logger.info(err);
                }
                var parent_node_object = parent_obj.data[0];
                var object_id = parent_node_object.objectId;
                var balance = parent_node_object.balance;
                var onedayprevious = new Date(todaydate.setDate(todaydate.getDate() - 1));
                domain.Ad_View_History.find({
                    "userView._id": object_id,
                    deleted: false,
                    complete_view: true,
                    date: {
                        $gte: onedayprevious
                    }
                }, function (err, viewHistroyObject) {
                    if (viewHistroyObject.length >= 3) {
                        neo4jDbConnection.cypherQuery("match(n:user) where id(n)={parent_node} set n.balance=n.balance+{amount}  RETURN n", {
                            parent_node: parent_node,
                            amount: total_making_money
                        }, function (err, parent_obj) {
                            if (err) {
                                //Logger.info("error in the add balance in user");
                                //Logger.info(err);
                            }
                            //Logger.info("total money in user", parent_obj.data[0].balance);
                            //Logger.info("money is add in the user");
                            addTranscationHistroy(object_id, total_making_money);
                            total_level = total_level - 1;
                            if (total_level != 0) {
                                //Logger.info("contrl of level ", total_level);
                                distributeMoneyToUpperUser(admin_commission, total_making_money, total_level, parent_node, user_id);
                            } else {
                                ammountAddAdminAcount(admin_commission, user_id);
                            }
                        });
                    } else {
                        //Logger.info("user is not able for  add the money");
                        admin_commission = admin_commission + total_making_money;
                        total_level = total_level - 1;
                        if (total_level != 0) {
                            //Logger.info("contrl of level ", total_level);
                            distributeMoneyToUpperUser(admin_commission, total_making_money, total_level, parent_node, user_id);
                        } else {
                            ammountAddAdminAcount(admin_commission, user_id);
                        }
                    }
                });
            });
        });
    }

    var ammountAddAdminAcount = function (admin_commission, user_id) {
        //Logger.info("control in the ammount add in admin account", admin_commission);
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
                //Logger.info("error in update admin money");
                //Logger.info(err);
            }
            //Logger.info("money is added in admin");
            //Logger.info(adminUpdatedObject.total_balance);
        });
    }

    var addTranscationHistroy = function (object_id, amount) {
        //Logger.info("control in the add Transcation history");
        var earningBucketCount = 1000;
        domain.User_Earning_Bucket.findOne({
            user_id: object_id,
            deleted: false,
            current_bucket_count: {
                $lt: earningBucketCount
            }
        }, function (err, errningBucketObject) {
            if (errningBucketObject) {
                domain.User_Earning_Bucket.findOneAndUpdate({
                    _id: errningBucketObject._id,
                    deleted: false
                }, {
                    $inc: {
                        current_bucket_count: 1
                    },
                    $push: {
                        earning_details: {
                            date: new Date(),
                            amount: amount
                        }
                    }
                }, {
                    new: true
                }, function (err, updatedBucketObject) {
                    domain.User.findOneAndUpdate({
                        _id: object_id,
                        deleted: false
                    }, {
                        $inc: {
                            user_earning_till_date: amount
                        }
                    }, {
                        new: true
                    }, function (err, updateUser) {
                        if (err) {
                            //Logger.info('errror in update user');
                            //Logger.info(err);
                        }
                        //Logger.info("money is added in the user account and balance", updateUser.user_earning_till_date);
                    });
                });
            } else {
                //Logger.info("control in the create new bucket");
                var erringBucketObj = new domain.User_Earning_Bucket({
                    user_id: object_id,
                    current_bucket_count: 1,
                    earning_details: [{
                        date: new Date(),
                        amount: amount
                }]
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
                            user_earning_till_date: amount
                        }
                    }, {
                        new: true
                    }, function (err, updateUser) {
                        if (err) {
                            //Logger.info('errror in update user');
                            //Logger.info(err);
                        }
                        //Logger.info("money is added in the user account and balance", updateUser.user_earning_till_date);
                    });
                });
            }
        });
    }



    var saveMLMObject = function (newNodeId, parentnodeId, callback) {
        //Logger.info(newNodeId, parentnodeId);
        var mlmobj = new domain.MLM({
            node_id: newNodeId,
            parent_node: parentnodeId,
            child_node1: 0,
            child_node2: 0
        });
        mlmobj.save(function (err, obj) {
            //Logger.info("object saved");
        });
        createRelationInNode(newNodeId, parentnodeId, callback);
    }
    var createRelationInNode = function (newNodeId, parentnodeId, callback) {
        //Logger.info("control in the createRelationInNode");
        neo4jDbConnection.insertRelationship(parentnodeId, newNodeId, 'Relationship', {}, function (err, node) {
            callback(err, node);
        })
    }
    var createUserNode = function (req, res, callback) {
        //Logger.info('control in the createUserNode function' + req.body.user);
        neo4jDbConnection.insertNode(req.body.user, 'user', function (err, node) {
            //Logger.info(node._id);
            var newNodeId = node._id;
            neo4jDbConnection.cypherQuery("match(n:user) where n.deleted=true return n", function (err, result) {
                //Logger.info("total number of deleted", result.data.length);
                ////Logger.info(result.data[0]);
                if (result.data.length != 0) {
                    var deletedNodeId = result.data[0]._id;
                    neo4jDbConnection.readIncomingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                        if (obj.length != 0) {
                            //Logger.info(obj[0]._id, "total parent node", obj.length)
                            var parentRelationId = obj[0]._id;
                            var parentNodeId = obj[0]._start;
                            // callback(err, obj);
                        }
                        neo4jDbConnection.readOutgoingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                            //Logger.info("total number of child node", obj.length)
                            //console.log(parentNodeId);
                            if (obj.length != 0) {
                                var child_node1 = obj[0]._end;
                                if (obj[1])
                                    var child_node2 = obj[1]._end;
                            }
                            //Logger.info("control in the creating relationship between differnt node");
                            neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)= " + deletedNodeId + " DETACH DELETE n", function (err, obj) {
                                domain.MLM.findOneAndUpdate({
                                    node_id: deletedNodeId
                                }, {
                                    node_id: newNodeId
                                }, null, function (err, obj) {
                                    //Logger.info("mlm db is update with delete", obj)
                                });
                                domain.MLM.find({
                                    node_id: parentNodeId
                                }, function (err, obj) {
                                    //Logger.info("mlm db is update child node with delete node");
                                    if (obj.child_node1 == deletedNodeId) {
                                        domain.MLM.findOneAndUpdate({
                                            node_id: parentNodeId
                                        }, {
                                            child_node1: newNodeId
                                        }, null, function (err, obj) {
                                            //Logger.info("child1 node is updated ", obj)
                                        });
                                    } else {
                                        domain.MLM.findOneAndUpdate({
                                            node_id: parentNodeId
                                        }, {
                                            child_node2: newNodeId
                                        }, null, function (err, obj) {
                                            //Logger.info("child 2 node is updated", obj)
                                        });
                                    }
                                });
                                if (child_node2) {
                                    //Logger.info("control in create relationship between two child node")
                                    neo4jDbConnection.cypherQuery("Match(p:user),(n:user),(c1:user),(c2:user) where ID(p)={p1} and ID(n)={n1} and ID(c1)={c1} and ID(c2)={c2} create (p)-[r:Relationship]->(n),(n)-[r1:Relationship]->c1,(n)-[r2:Relationship]->c2", {
                                        p1: parentNodeId,
                                        n1: newNodeId,
                                        c1: child_node1,
                                        c2: child_node2
                                    }, function (err, obj) {
                                        //Logger.info("control in the last phase")
                                        callback(err, obj);
                                    });
                                } else if (child_node1) {
                                    //Logger.info("control in the create relationship between one child node");
                                    neo4jDbConnection.cypherQuery("Match(p:user),(n:user),(c1:user) where ID(p)={p1} and ID(n)={n1} and ID(c1)={c1}  create (p)-[r:Relationship]->(n),(n)-[r1:Relationship]->c1", {
                                        p1: parentNodeId,
                                        n1: newNodeId,
                                        c1: child_node1
                                    }, function (err, obj) {
                                        //Logger.info("control in the last phase")
                                        callback(err, obj);
                                    });
                                } else {
                                    //Logger.info("control in the create the relationship between only parent node");
                                    createRelationInNode(newNodeId, parentNodeId, callback);
                                }
                            });

                        });
                    });
                } else {
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
                                    saveMLMObject(newNodeId, obj.node_id, callback);
                                });
                            } else if (obj[0].child_node2 == 0) {
                                //Logger.info("child node2 0");
                                domain.MLM.findOneAndUpdate({
                                    _id: obj[0]._id
                                }, {
                                    child_node2: newNodeId
                                }, null, function (err, obj) {
                                    saveMLMObject(newNodeId, obj.node_id, callback);
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
                                child_node2: 0
                            });
                            mlmobj.save(function (err, obj) {
                                callback(err, obj);
                            });
                        }
                    });
                }
            });
        });
    }
    var getUserNode = function (req, res, callback) {
        //Logger.info('contorl in the getUserNode function')
        var nodeid = 50; //req.params.id;
        /*neo4jDbConnection.readNode(nodeid, function (err, node) {
            callback(err, node);
        });*/
        /*neo4jDbConnection.readAllRelationshipsOfNode(nodeid, function (err, result) {
            callback(err,result);
        });*/
        neo4jDbConnection.readIncomingRelationshipsOfNode(nodeid, function (err, result) {
                //Logger.info("result");
                //Logger.info(result[0]._start);

                //callback(err, result);
            })
            /* neo4jDbConnection.cypherQuery("MATCH (n:user)-[r:Relationship]->(m:user) RETURN n AS FROM , r AS `->`, m AS to    Limit 1",function(err,result){
                 callback(err,result);
             });*/
    }
    var updateUserNode = function (req, res, callback) {
        //Logger.info('control in the update user node function');
        var nodeid = req.params.id;
        var user = req.body.user;
        //console.log(nodeid)
        neo4jDbConnection.updateNodesWithLabelsAndProperties('user', {
            _id: nodeid
        }, user, function (err, node) {
            callback(err, node);
        });
    }
    var removeUserNode = function (req, res, callback) {
        //Logger.info('control in the remove user node function', req.params.id);
        var nodeid = req.params.id;
        /*neo4jDbConnection.deleteNode(nodeid, function (err, node) {
            callback(err, node);
        });*/
        /*neo4jDbConnection.deleteRelationship(nodeid,function(err,node){
            callback(err,node);
        })*/
        //it will softdelete the node in avl tree
        neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)=" + nodeid + " set n.deleted=true", function (err, obj) {
            callback(err, obj);
        });

    }
    var createRelationshipWithTwoNodes = function (req, res, callback) {
        //Logger.info("control in the createRelationshipWithTwoNodes");
        var nodeid1 = req.params.id1;
        var nodeid2 = req.params.id2;
        neo4jDbConnection.insertRelationship(nodeid1, nodeid2, 'Relationship', {
            price: 100
        }, function (err, node) {
            callback(err, node);
        })
    }

    var getRelationshipBetweenNodes = function (req, res, callback) {
        //Logger.info("control in the get getRelationshipBetweenTwoNodes between two nodes");
        var node_id = 3;
        domain.MLM.find({
            deleted: false
        }, {
            node_id: 1
        }, function (err, obj) {
            //Logger.info("total number of node in MLM", obj.length);
            var nodeidarray = [];
            for (var i = 0; i < obj.length; i++) {
                nodeidarray.push(obj[i].node_id);
            }
            async.map(nodeidarray, genearteNetworkStatus, function (err, result) {
                if (err) {
                    //Logger.info("error in the generate network data");
                    //Logger.info(err);
                }
                //Logger.info("node processing is finish");
                callback(null, SetResponse.setSuccess("your work of get network detail is finish", result));
            });
        });
    }
    var genearteNetworkStatus = function (node_id, callback) {
        //it will generate the query array    
        var queryarray = generateThequeryArray();
        var User_Network_detailsObj = new domain.User_Network_details({
            user_id: 'userid',
            neo4j_node_id: node_id
        });
        User_Network_detailsObj.save(function (err, user_network_saveObject) {
            //it will set the value of node globelly
            getDatafrombottomlevel.node_id = node_id;
            getDatafrombottomlevel.user_network_id = user_network_saveObject._id;
            async.map(queryarray, getDatafrombottomlevel.Neo4jqueryfunction.bind(getDatafrombottomlevel), function (err, result) {
                if (err) {
                    //Logger.info("error in the async map");
                    //Logger.info(err);
                }
                //Logger.info("final result", node_id, "completed");
                callback(null, node_id);
            });
        });
    }
    var getDatafrombottomlevel = {
        Neo4jqueryfunction: function (object, callback) {
            //Logger.info(object.level, this.node_id, this.user_network_id);
            var node_id = this.node_id
            var user_network_id = this.user_network_id;
            neo4jDbConnection.cypherQuery(object.mainquery + object.level, {
                node_id: node_id
            }, function (err, obj) {
                if (err) {
                    //Logger.info("error in cypher query");
                    //Logger.info(err);
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
                                name: obj.data[i].name
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
                        ////Logger.info(obj);
                        callback(null, obj);
                    }
                } else {
                    callback(null, obj);
                }
            });
        }
    }

    var generateThequeryArray = function () {
        var level1query = "Match(n:user) where id(n)={node_id} Match(n)-[R1:Relationship]->(level1)";
        var level2query = level1query + "-[R2:Relationship]->(level2)";
        var level3query = level2query + "-[R3:Relationship]->(level3)";
        var level4query = level3query + "-[R4:Relationship]->(level4)";
        var level5query = level4query + "-[R5:Relationship]->(level5)";
        var level6query = level5query + "-[R6:Relationship]->(level6)";
        var level7query = level6query + "-[R7:Relationship]->(level7)";
        var level8query = level7query + "-[R8:Relationship]->(level8)";
        var level9query = level8query + "-[R9:Relationship]->(level9)";
        var level10query = level9query + "-[R10:Relationship]->(level10)";
        var queryreturn = " return ";
        var queryarray = [{
            mainquery: level1query + queryreturn,
            level: "level1"
        }, {
            mainquery: level2query + queryreturn,
            level: "level2"
        }, {
            mainquery: level3query + queryreturn,
            level: "level3"
        }, {
            mainquery: level4query + queryreturn,
            level: "level4"
        }, {
            mainquery: level5query + queryreturn,
            level: "level5"
        }, {
            mainquery: level6query + queryreturn,
            level: "level6"
        }, {
            mainquery: level7query + queryreturn,
            level: "level7"
        }, {
            mainquery: level8query + queryreturn,
            level: "level8"
        }, {
            mainquery: level9query + queryreturn,
            level: "level9"
        }, {
            mainquery: level10query + queryreturn,
            level: "level10"
        }];
        return queryarray;
    }

    return {
        getRelationshipBetweenNodes: getRelationshipBetweenNodes,
        createUserNode: createUserNode,
        removeUserNode: removeUserNode,
        getUserNode: getUserNode,
        updateUserNode: updateUserNode,
        createRelationshipWithTwoNodes: createRelationshipWithTwoNodes,
        getLevls: getLevls,
        distributeMoneyToUpperUser: distributeMoneyToUpperUser,
        getRewards: getRewards,
        getNotification: getNotification
    }
};
