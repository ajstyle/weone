 var mosca = require('mosca')
 var brokerServer = function () {
     var ascoltatore = {
         //using ascoltatore
         /*type: 'mongo',
         url: 'mongodb://localhost:27017/mqtt',
         pubsubCollection: 'ascoltatori',
         mongo: {}*/
     };
     var settings = {
         port: 3010,

         backend: ascoltatore
             // http: {port: 3004, bundle: true, static: './'} 


     };

     //here we start mosca
     var server = new mosca.Server(settings);
     server.on('ready', setup);

     // fired when the mqtt server is ready
     function setup() {
         Logger.info('Mosca server is up and running')
     }

     // fired whena  client is connected
     server.on('clientConnected', function (client) {
         Logger.info('client connected', client.id);
     });

     // fired when a message is received
     server.on('published', function (packet, client) {
         Logger.info('Published : ', packet.payload);
         // Logger.info('client',client)

     });

     // fired when a client subscribes to a topic
     server.on('subscribed', function (topic, client) {
         //Logger.info('subscribed : ', topic);
     });

     // fired when a client subscribes to a topic
     server.on('unsubscribed', function (topic, client) {
         // Logger.info('unsubscribed : ', topic);
     });

     // fired when a client is disconnecting
     server.on('clientDisconnecting', function (client) {
         //Logger.info('clientDisconnecting : ', client.id);
     });
     server.on('message', function (topic, msg) {
         Logger.info('topddfdfafda', msg)
     });

     var getMessageInfo = function (messageObject) {
         Logger.info("control in the message info ", messageObject);
         var user_details = messageObject.chating_users;
         var topic_ids = messageObject.channels;
         var message = messageObject.messageObject;
         domain.Chat_History.findOne({
             topic_ids: {
                 $elemMatch: topic_ids
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

     var createNewHistoryObject = function (user_details, topic_ids, message) {
         Logger.info("createNewHistoryObject");
         var chatHistoryObj = domain.Chat_History({
             user_details: user_details
             , topic_ids: topic_ids
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
     
     var addMessageInBucket = function (chat_history_id, message) {
         Logger.info("control in the add message in bucket");
         var bucketSizeOfMessage = 2000;
         domain.Chat_Bucket.findOne({
             chat_history_id: chat_history_id
             , bucket_count: {
                 $lt: bucketSizeOfMessage
             }
         }, function (err, chatBucketObject) {
             if (chatBucketObject) {
                 addMessageInExistBucket(chatBucketObject._id, message);
             } else {
                 Logger.info("create new chat bucket");
                 createNewChatBucket(chat_history_id, messages);
             }
         });
     }
     
     var createNewChatBucket = function (chat_history_id, messages) {
         Logger.info('create new chat bucket');
         var chatBucketObject = new domain.Chat_Bucket({
             bucket_count: 1
             , chat_history_id: chat_history_id
             , messages: [messages]
         });
         chatBucketObject.save(function (err, saveBucketObject) {
             if (saveBucketObject) {
                 domain.Chat_History.findOneAndUpdate({
                     _id: chat_history_id
                     , deleted: false
                 }, {
                     current_chat_bucket: saveBucketObject._id
                     , $push: {
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
     
     var addMessageInExistBucket = function (bucket_id, message) {
         Logger.info("addMessageInExistBucket")
         domain.Chat_Bucket.findOneAndUpdate({
             _id: bucket_id
         }, {
             $push: {
                 messages: message
             }
             , bucket_count: {
                 $inc: 1
             }
         }, function (err, updateBucketObject) {
             if (updateBucketObject)
                 Logger.info("push message in bucket");
         });
     }


 }
 module.exports.brokerServer = brokerServer