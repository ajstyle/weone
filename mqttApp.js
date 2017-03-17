/*
char format
{
channels:[pus/sub channel],
messageObject:{
user_id:"A user who send message or publish the channel",
name:"name of person who send message or publish the channel"
message:"chatting message"
messageType:"video audio text",
timeStamp:'33323233',
thumbnailUrl:'chat and video thubnailUrl',
fileUrl:'main url of file and video'
}
receiverId:'a person who will receive',
senderId:'a person who send message',
messageId:'344334434',
}*/

global.configurationHolder = require('./configurations/DependencyInclude.js')
global.mqttapp = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
var sender = new gcm.Sender(configurationHolder.config.googleGCMKey);
Logger.info(configurationHolder.config.googleGCMKey)
var apnError = function (err) {
    Logger.info("APN Error..", err);
}

var options = {
    "pfx":configurationHolder.config.apnsCertificate,
    "passphrase": "oodles",
    "gateway": configurationHolder.config.gateWayApns,
    "port": 2195,
    "enhanced": true,
    "cacheLength": 5,
    "production":configurationHolder.config.isApnsProduction
};
options.errorCallback = apnError;
var apnConnection = new apn.Connection(options);

var client = mqtt.connect(configurationHolder.config.mqttUrl);
client.on('connect', function () {
    Logger.info("subscribe");
    client.subscribe('#');
});
/*
This event fire when message will be comes on mqtt.Event will helps to send the notification and store the message
in database.
*/
client.on('message', function (topic, message) {
    Logger.info("message  recived");
    try {
        var object = message.toString();
        var jsonObject = JSON.parse(object);
        Logger.info("type",jsonObject.messageObject.messageType);
        if(jsonObject.messageObject.messageType!='received'){
        getMessageInfo(jsonObject); //receiverId
        checkForNotification(jsonObject.receiverId, jsonObject.senderId, jsonObject.messageObject.message,jsonObject.messageObject.messageType,jsonObject.messageObject.name);
        }
    } catch (e) {
        Logger.info("Exception is. in reciveing message.", e)
    }
});
/*
This method will check the Notification and sends to GCM and APNS notification services.
@receiverId:This is object id who receive the message and notification
@senderId:This is object id who sends the message.
@message:The message which you have to send
@type:The message type is image,video or text.
@name:The name of person who sends the message.
*/
var checkForNotification = function (receiverId, senderId, message,type,name) {
    try {
        Logger.info(message, "control in the check for notification", receiverId,type);
        domain.User.findOne({
            _id: receiverId,
            deleted: false
        }, function (err, userObject) {
            //userObject.device_status == false &&
            if(userObject.blockFriends.indexOf(senderId)==-1){
            try {
                var messageToDisplay='';
                switch(type){
                    case 'text':
                    messageToDisplay=name+" sent you message";
                    break;
                    case 'video':
                    messageToDisplay=name+" sent you video";
                    break;
                    case 'image':
                    messageToDisplay=name+" sent you an image";
                    break;
                    default:
                    messageToDisplay=name+" sent you message";
                }
                   if(!name)
                   messageToDisplay="you receive a message";
                /*if (userObject.notification_status == true) {
                    Logger.info(userObject.notification_status, "send notification to user");*/
                    if (userObject.app_platform == 'android') {
                        gcmPushNotification(messageToDisplay, userObject.registration_token, senderId, receiverId, message);
                    } else if (userObject.app_platform == 'ios') {
                        apnsPushNotification(messageToDisplay, userObject.registration_token, senderId, receiverId);
                    } else
                        Logger.info("invalid platform", userObject.app_platform);
            /*    } else {
                    Logger.info("no need to send the notification");
                }*/
            } catch (E) {
                Logger.info("Reciver doesen't exist exception in checkForNotification", E);
            }
            }else{
                Logger.info("user is blocked so we can sent the message")
            }
        });
    } catch (e) {
        Logger.info("exception is in checkForNotification method ", e);
    }
}
/*
This GCM(Google Cloud Messaging service) used for android to send the push notification.
@chatMessage:Message which send in the notification
@deviceToken:The unique device Id for gcm push notification
@senderId:The user who sends the notification
@receiverId:The user who receives the notification
*/
var gcmPushNotification = function (chatMessage, deviceToken, senderId, receiverId, messageToSend) {
    Logger.info("chatMessage", deviceToken, messageToSend)
    try {
        domain.Chat_Channel.findOne({
            from_user: receiverId,
            to_user: senderId
        }).populate("to_user", "image_url name phonenumber").exec(function (err, chatChannelObject) {
            Logger.info(err,"android chatChannelObject",chatChannelObject.toString());
            chatChannelObject = JSON.parse(JSON.stringify(chatChannelObject));
            chatChannelObject.message = messageToSend;
            var response = {}
            response.sender = chatChannelObject.to_user;
            response.receiver = chatChannelObject.from_user;
            response.publish_topic = chatChannelObject.publish_topic;
            response.subscribe_topic = chatChannelObject.subscribe_topic;
            response.message = messageToSend;
            var message = new gcm.Message({
                data: {
                    body: response,
                }
            });
            var registrationTokens = [];
            registrationTokens.push(deviceToken);
            //message.addData("data", chatChannelObject);
            message.addData("type", "chatNotification");
            sender.send(message, {
                registrationTokens: registrationTokens
            }, function (err, response) {
                if (err) {
                    Logger.info("error in notification send GcmPushNotification");
                }
                Logger.info("notification response", response);
            });
        });
    } catch (e) {
        Logger.info("Exception in gcmPushNotification function", e);
    }
}
/*
APNS(Apple push notification service) is used for send the push notification for ios.
@message:Message which send in the notification
@deviceToken:The unique device Id for apns push notification
@senderId:The user who sends the notification
@receiverId:The user who receives the notification
*/
var apnsPushNotification = function (message, deviceToken, senderId, receiverId) {
        Logger.info(message, "control in the send message", deviceToken, senderId, receiverId);
        try {
            domain.Chat_Channel.findOne({
                from_user: receiverId,
                to_user: senderId
            }).populate("to_user", "image_url name").exec(function (err, chatChannelObject) {
               Logger.info(err,"ios chatChannelObject",chatChannelObject.toString());
               domain.User.findOneAndUpdate({_id:receiverId,deleted:false},{$inc:{'badge_count_ios.chat_badge_count':1}},{new:true},function(err,obj){
                 if(!err){
                   var count = obj.badge_count_ios.global_badge_count + obj.badge_count_ios.reward_badge_count + obj.badge_count_ios.chat_badge_count + obj.badge_count_ios.update_badge_count;
                   try {
                       var myDevice, note;
                       myDevice = new apn.Device(deviceToken);
                       note = new apn.Notification();
                       note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                       note.badge = count;
                       note.sound = "ping.aiff";
                       note.alert = message;
                       note.payload = {
                           'messageFrom': chatChannelObject,
                           'type': 'chatNotification'
                       };
                       if (apnConnection) {
                           apnConnection.pushNotification(note, myDevice);
                       }
                   } catch (e1) {
                       Logger.info("exception is in apnsPushNotification function", e1);
                   }
                 }else {
                   console.log("some error in sending the push notification",err);
                 }
               })
            });
        } catch (e) {
            Logger.info("chatChannel not found in ios exception", e);
        }
    }
/*
This method helps to find the unique chat history object on basis of topics id because these ids are unique.
@messageObject:This object contains topics ids,receiverId,senderId etc. The message related all information.
*/
var getMessageInfo = function (messageObject) {
    Logger.info("control in the message info ", messageObject);
    var user_details = [];
    user_details.push(messageObject.receiverId);
    user_details.push(messageObject.senderId)
    var topic_ids = messageObject.channels;
    var message = messageObject.messageObject;
    if(message.thumbnailUrl){
      var urlArray=message.thumbnailUrl.split("/");
        message.thumbnailUrl=urlArray[urlArray.length-1];
    }
    if(message.fileUrl){
        var urlFileArray=message.fileUrl.split("/");
        message.fileUrl=urlFileArray[urlFileArray.length-1];
    }
    domain.Chat_History.findOne({
        topic_ids: {
            $all: topic_ids
        }
    }, function (err, chatHistoryObject) {
        if (chatHistoryObject) {
            addMessageInBucket(chatHistoryObject._id, message);
        } else {
            Logger.info("control in the create new history object");
            createNewHistoryObject(user_details, topic_ids, message);
        }
    });
}
/*
This history object is not exists then new history object is created.
@user_details:both sender and receiver users.
@topic_ids:both pub/sub ids
@message:message which you want to save
*/
var createNewHistoryObject = function (user_details, topic_ids, message) {
    Logger.info("createNewHistoryObject");
    var chatHistoryObj = domain.Chat_History({
        user_details: user_details,
        topic_ids: topic_ids
    });
    chatHistoryObj.save(function (err, savedChathistoryObject) {
        if (savedChathistoryObject) {
            addMessageInBucket(savedChathistoryObject._id, message);
        } else {
            Logger.info("chat history object is not saved");
            Logger.info("error", err);
        }
    });
}
/*
This message will be store in chat bucket.It will check  the buckets on basis of chat_history_id .
If the chat buckets exists then it will store message in existing bucket otherwise it will be store in the new buckets.
@chat_history_id:Unquie id of the chat history object who links with the chat bucket.
*/
var addMessageInBucket = function (chat_history_id, message) {
    Logger.info("control in the add message in bucket");
    var bucketSizeOfMessage = 2000;
    domain.Chat_Bucket.findOne({
        chat_history_id: chat_history_id,
        bucket_count: {
            $lt: bucketSizeOfMessage
        }
    }, function (err, chatBucketObject) {
        if (chatBucketObject) {
            addMessageInExistBucket(chatBucketObject._id, message);
        } else {
            Logger.info("create new chat bucket");
            createNewChatBucket(chat_history_id, message);
        }
    });
}
/*
it will be used to create the new chat bucket of message when existing buckets capcity full or new bucket .
@chat_history_id:This will be unique id who referance with the chat bucket.
@messages:A message which you want to store in chat bucket.
*/
var createNewChatBucket = function (chat_history_id, messages) {
    Logger.info('create new chat bucket');
    var chatBucketObject = new domain.Chat_Bucket({
        bucket_count: 1,
        chat_history_id: chat_history_id,
        messages: [messages]
    });
    chatBucketObject.save(function (err, saveBucketObject) {
        if (saveBucketObject) {
            domain.Chat_History.findOneAndUpdate({
                _id: chat_history_id,
                deleted: false
            }, {
                current_chat_bucket: saveBucketObject._id,
                $push: {
                    chat_bucket: saveBucketObject._id
                }
            }, {
                new: true
            }, function (err, updateChatHistoryObject) {
                if (updateChatHistoryObject)
                    Logger.info("update in chat history");
            });
        } else {
            Logger.info("bucket object ")
        }
    });
}
/*
This method is used to the add the message is existing buckets.It will push the message in existing bucket.
@bucket_id:The unique-ref-id which is used to find the bucket.
@message:The message object is used to push in the bucket
*/
var addMessageInExistBucket = function (bucket_id, message) {
    Logger.info("addMessageInExistBucket")
    domain.Chat_Bucket.findOneAndUpdate({
        _id: bucket_id
    }, {
        $push: {
            messages: message
        },
        $inc: {
            bucket_count: 1
        }
    }, {
        new: true
    }, function (err, updateBucketObject) {
        if (updateBucketObject)
            Logger.info("push message in bucket");
        else
            Logger.info(err);
    });
}
mqttapp.listen(3010);
