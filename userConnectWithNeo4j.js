global.configurationHolder = require('./configurations/DependencyInclude.js')
global.userConnectWithNeo4j = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
var MLMService = require('./application/controller-service-layer/services/MLMService'); //require('./MLMService');
Logger.info("userConnectWithNeo4j  is run in %s mode", userConnectWithNeo4j.settings.env);
var sync = require('synchronize')
global.neo4jDbConnection = new neo4j(configurationHolder.config.neo4jUrl);
/*This MLM service is used to create the balance binary tree in neo4j to achieve the MLM(Multi level Marketing) */

/*
This function is used to save the Node information in the db.
@newNodeId:node create in neo4j
@parentnodeId:parent node for neo4j 
@user_details:User unique id for user details
*/
var saveMLMObject = function (newNodeId, parentnodeId, user_details, callback) {
    Logger.info(newNodeId, parentnodeId);
    var mlmobj = new domain.MLM({
        node_id: newNodeId,
        parent_node: parentnodeId,
        child_node1: 0,
        child_node2: 0,
        user_details: user_details
    });
    mlmobj.save(function (err, obj) {
        Logger.info("object saved");

    });
    createRelationInNode(newNodeId, parentnodeId, callback);
}
var createRelationInNode = function (newNodeId, parentnodeId, callback) {
    Logger.info("control in the createRelationInNode");
    neo4jDbConnection.insertRelationship(parentnodeId, newNodeId, 'Relationship', {}, function (err, node) {
        console.log("FFFFFFFFFFFFINALLLLLLLLLLL")
        callback(null, node)
    })
}
var createUserNode = function (user, callback) {
    Logger.info('control in the createUserNode function' + user);
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
    Logger.info(userObj)
    neo4jDbConnection.insertNode(userObj, 'user', function (err, node) {
        Logger.info(node);
        var newNodeId = node._id;
        domain.User.findOneAndUpdate({
            _id: user._id
        }, {
            neo4J_node_id: newNodeId
        }, null, function (err, updateObject) {
            Logger.info("Node is updated in the user table");
        })
        neo4jDbConnection.cypherQuery("match(n:user) where n.deleted=true return n", function (err, result) {
            Logger.info("total number of deleted", result.data.length);
            //Logger.info(result.data[0]);
            if (result.data.length != 0) {
                var deletedNodeId = result.data[0]._id;
                neo4jDbConnection.readIncomingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                    if (obj.length != 0) {
                        Logger.info(obj[0]._id, "total parent node", obj.length)
                        var parentRelationId = obj[0]._id;
                        var parentNodeId = obj[0]._start;
                    }
                    neo4jDbConnection.readOutgoingRelationshipsOfNode(deletedNodeId, function (err, obj) {
                        Logger.info("total number of child node", obj.length)
                        Logger.info(parentNodeId);
                        if (obj.length != 0) {
                            var child_node1 = obj[0]._end;
                            if (obj[1])
                                var child_node2 = obj[1]._end;
                        }
                        Logger.info("control in the creating relationship between differnt node");
                        neo4jDbConnection.cypherQuery("Match(n:user) where ID(n)= " + deletedNodeId + " DETACH DELETE n", function (err, obj) {
                            createRelationShipWithNodes(deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user._id, callback);
                        });
                    });
                });
            } else {
                addNewNodeMLM(newNodeId, user._id, callback);
            }
        });
    });
}
var createRelationShipWithNodes = function (deletedNodeId, newNodeId, child_node1, child_node2, parentNodeId, user_details, callback) {
    if (!parentNodeId)
        parentNodeId = 0;

    domain.MLM.findOneAndUpdate({
        node_id: deletedNodeId
    }, {
        node_id: newNodeId,
        user_details: user_details
    }, null, function (err, obj) {
        Logger.info("mlm db is update with delete", obj)
    });
    domain.MLM.find({
        node_id: parentNodeId
    }, function (err, obj) {
        Logger.info("mlm db is update child node with delete node");
        if (obj.child_node1 == deletedNodeId) {
            domain.MLM.findOneAndUpdate({
                node_id: parentNodeId
            }, {
                child_node1: newNodeId
            }, null, function (err, obj) {
                Logger.info("child1 node is updated ", obj)
            });
        } else {
            domain.MLM.findOneAndUpdate({
                node_id: parentNodeId
            }, {
                child_node2: newNodeId
            }, null, function (err, obj) {
                Logger.info("child 2 node is updated", obj)
            });
        }
    });

    if (parentNodeId == 0) {
        Logger.info("control in create relationship of admin");
        neo4jDbConnection.cypherQuery("Match(n:user),(c1:user),(c2:user) where  ID(n)={n1} and ID(c1)={c1} and ID(c2)={c2} create (n)-[r1:Relationship]->c1,(n)-[r2:Relationship]->c2", {
            n1: newNodeId,
            c1: child_node1,
            c2: child_node2
        }, function (err, obj) {
            Logger.info("control in the last phase admin deleled node")
            callback(null, obj)
        });

    } else if (child_node2) {
        Logger.info("control in create relationship between two child node")
        neo4jDbConnection.cypherQuery("Match(p:user),(n:user),(c1:user),(c2:user) where ID(p)={p1} and ID(n)={n1} and ID(c1)={c1} and ID(c2)={c2} create (p)-[r:Relationship]->(n),(n)-[r1:Relationship]->c1,(n)-[r2:Relationship]->c2", {
            p1: parentNodeId,
            n1: newNodeId,
            c1: child_node1,
            c2: child_node2
        }, function (err, obj) {
            Logger.info("control in the last phase")
            callback(null, obj)
        });
    } else if (child_node1) {
        Logger.info("control in the create relationship between one child node");
        neo4jDbConnection.cypherQuery("Match(p:user),(n:user),(c1:user) where ID(p)={p1} and ID(n)={n1} and ID(c1)={c1}  create (p)-[r:Relationship]->(n),(n)-[r1:Relationship]->c1", {
            p1: parentNodeId,
            n1: newNodeId,
            c1: child_node1
        }, function (err, obj) {
            Logger.info("control in the last phase")
            callback(null, obj)
        });
    } else {
        Logger.info("control in the create the relationship between only parent node");
        createRelationInNode(newNodeId, parentNodeId, callback);
    }
}

var addNewNodeMLM = function (newNodeId, user_details, callback) {
    Logger.info("contorl in the add new node avl tree")
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
                Logger.info("child_node1 0")
                domain.MLM.findOneAndUpdate({
                    _id: obj[0]._id
                }, {
                    child_node1: newNodeId
                }, null, function (err, obj) {
                    saveMLMObject(newNodeId, obj.node_id, user_details, callback);
                });
            } else if (obj[0].child_node2 == 0) {
                Logger.info("child node2 0");
                domain.MLM.findOneAndUpdate({
                    _id: obj[0]._id
                }, {
                    child_node2: newNodeId
                }, null, function (err, obj) {
                    saveMLMObject(newNodeId, obj.node_id, user_details, callback);
                });
            } else {
                Logger.info("in invalid state");
                callback(null, obj)
            }
        } else {
            Logger.info('control in create admin obj');
            var mlmobj = new domain.MLM({
                node_id: newNodeId,
                parent_node: 0,
                child_node1: 0,
                child_node2: 0,
                user_details: user_details
            });
            mlmobj.save(function (err, obj) {
                Logger.info("object is saved successfully");
                //callback(err, obj);
                callback(null, obj)
            });
        }
    });
}

var connectWithTree = function () {
    domain.User.find({
        role: 'ROLE_USER',
        deleted: false,
        neo4J_node_id: {
            $eq: ''
        }
    }, function (err, userObjects) {
        console.log("Total number of user who are unconnected with neo4j", userObjects.length);
        var createUserNode1 = sync(createUserNode);
        sync.fiber(function () {
            for (var i = 0; i < userObjects.length; i++) {
                console.log("contorl in the user connect with tree", i)
                    //console.log(MLMService)
                createUserNode1(userObjects[i]);
            }
        })
    });
}

connectWithTree();


userConnectWithNeo4j.listen(3003);