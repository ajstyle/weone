PushService = function () {
    var sender = new gcm.Sender(configurationHolder.config.googleGCMKey);
    var apnError = function (err) {
        //Logger.error("APN Error:", err);
    }

    var options = {
        "pfx": publicdir+"/WEONE_DEVELOPMENT_APNS_Certificates.p12",
        //"pfx":publicdir+"/WeOne_APNS_Production.p12",
        "passphrase": "oodles",
        "gateway": configurationHolder.config.gateWayApns,
        "port": 2195,
        "enhanced": true,
        "cacheLength": 5,
        "production":configurationHolder.config.isApnsProduction
    };
    options.errorCallback = apnError;
    var apnConnection = new apn.Connection(options);

  PushService.gcmPushNotification=function (message, deviceToken, type) {
        // Logger.info("gcmPushNotification", deviceToken);
        try{
        var message = new gcm.Message({
            data: {
                body: message
            }
        });
        if(deviceToken.constructor === Array){
          registrationTokens = deviceToken;
          // Logger.info("Sending 1000 gcm noti in bulk",registrationTokens.length,deviceToken.length);
        }else {
          var registrationTokens = [];
          registrationTokens.push(deviceToken);
          // Logger.info("Sending single notification");
        }
        message.addData("type", type);


        sender.send(message, {
            registrationTokens: registrationTokens
        }, function (err, response) {
            if (err) {
                // Logger.info("error in notification send GcmPushNotification");
                Logger.error(err);
            }else {
              // Logger.info("notification response", response);
            }
        });



        }catch(e){
            // Logger.info("exception in gcm",e);
        }
    }

     PushService.apnsPushNotification=function (userId, message, deviceToken, type) {
        //Logger.info(message, "control in the apnsPushNotification", deviceToken, type);
        var badge_count = 0;

        async.auto({
          getBadgeCount:function(next, result){
            // return getBadgeTypeCount(userId, deviceToken,type,next);
            next(null);
          },
          sendPushNotification: ['getBadgeCount',function(next, result){
            badge_count = 1;
            // badge_count = result.getBadgeCount;
            ////Logger("the badge count is",badge_count);
            try {
                var myDevice, note;
                myDevice = new apn.Device(deviceToken);
                note = new apn.Notification();
                note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                note.badge = badge_count;
                note.sound = "ping.aiff";
                note.alert = message;
                note.payload = {
                    'type': type
                };
                if (apnConnection) {
                    apnConnection.pushNotification(note, myDevice);
                }
            } catch (e) {
                //Logger.info("exception apns", e);
            }
            next(null);
          }]
        },function(err, result){
            //Logger.info("the notification is sent successfully");
        })
    }

    PushService.apnsBulkPushNotification = function(message, deviceTokens, type){
      // Logger.info("Sending Bulk ios Push Notifications",deviceTokens.length)
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.badge = 1;//badge_count;
      note.sound = "ping.aiff";
      note.alert = message;
      note.payload = {
          'type': type
      };
      if (apnConnection) {
          apnConnection.pushNotification(note, deviceTokens);
      }
    }

    var getBadgeTypeCount = function(userId, deviceToken,type, next){
      if(type == 'global'){
        domain.User.findOneAndUpdate({_id:userId,deleted:false},{$inc:{'badge_count_ios.global_badge_count':1}},{new:true},function(err,obj){
          if(!err){
            var count = obj.badge_count_ios.global_badge_count + obj.badge_count_ios.reward_badge_count + obj.badge_count_ios.chat_badge_count + obj.badge_count_ios.update_badge_count;
            next(err,count);
          }else {
            //Logger.info("some error in sending the push notification",err);
            next(null);
          }
        })
      }else if(type == 'reward'){
        domain.User.findOneAndUpdate({_id:userId,deleted:false},{$inc:{'badge_count_ios.reward_badge_count':1}},{new:true},function(err,obj){
          if(!err){
            var count = obj.badge_count_ios.global_badge_count + obj.badge_count_ios.reward_badge_count + obj.badge_count_ios.chat_badge_count + obj.badge_count_ios.update_badge_count;
            next(err,count);
          }else {
            //Logger.info("some error in sending the push notification",err);
            next(null);
          }
        })
      }else if(type == 'update'){
        domain.User.findOneAndUpdate({_id:userId,deleted:false},{$inc:{'badge_count_ios.update_badge_count':1}},{new:true},function(err,obj){
          if(!err){
            var count = obj.badge_count_ios.global_badge_count + obj.badge_count_ios.reward_badge_count + obj.badge_count_ios.chat_badge_count + obj.badge_count_ios.update_badge_count;
            next(err,count);
          }else {
            //Logger.info("some error in sending the push notification",err);
            next(null);
          }
        })
      }
    }
}
 module.exports=PushService;
