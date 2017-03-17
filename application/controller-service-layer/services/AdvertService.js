var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
AdvertService = function (app) {
    this.app = app;
};

AdvertService.prototype = new BaseService();
/*This method used to create the smil-file-url for video and image-file-url for  image
@objectArray:this array had advertisement information
*/
var createURL = function (objectArray) {
    //Logger.info("thumbnail", objectArray.length)
    for (var i = 0; i < objectArray.length; i++) {
        var object = {};
        if (objectArray[i].thumbnail) {
            object.thumbnailurl = configurationHolder.config.imageUrl + "video/" + objectArray[i].fileInformation.entry_id + '/' + objectArray[i].thumbnail;
            objectArray[i].thumbnail = object.thumbnailurl;
        }
        if (objectArray[i].smil_file_name) {
            object.smil_file_name = configurationHolder.config.smile_URL + objectArray[i].fileInformation.entry_id + "/" + 'smil:' + objectArray[i].smil_file_name + "/jwplayer.smil";
            objectArray[i].smil_file_name = object.smil_file_name;
        }
    }
    return objectArray;
}
/*
It will used to show advertisements to users.In this method their are various filter like age ,gender,ad_start date ,ad_end date and ad_status
@user:it contains the information of user which comes from authorized middleware
*/
AdvertService.prototype.getUserAdvertisement = function (limit, skip, user, callback) {
   // //Logger.info("control in the getUserAdvertisement serviceLayer");
    var userAge = user.age
    var userGender = user.gender;
    //var getNewAdvertisment = sync(getNewAdvertisements);
    var newAdvertisementArray = [];
   // sync.fiber(function () {
      //  newAdvertisementArray = getNewAdvertisment(userAge, userGender, user._id,false);
        ////Logger.info("userAge is..", userAge,"new adverisements", newAdvertisementArray.length);
        async.auto({
           getAdvertisementForUser:function(next,result){
               return queryForUserAdvertisement(userAge,userGender,skip,limit,next)
           }
          },function(err,result){
             //Logger.info("jjjjjjjjjjjj",result.getAdvertisementForUser.length);
            if (result.getAdvertisementForUser.length != 0) {
                var newAdvertismentIds=result.getAdvertisementForUser.newAdvertismentIds;
                //Logger.info(result.getAdvertisementForUser.newAdvertismentIds);
               /* for(var i=0;i<result.getAdvertisementForUser.length;i++){
                    //Logger.info(result.getAdvertisementForUser)
                }*/
                var entry_id_map = result.getAdvertisementForUser.map(function(advert){
                  return advert.fileInformation.entry_id;
                })
                var profile_map = {};
                domain.Transcoding_Profile.find(
                  {advertisment_entry_id:{$in:entry_id_map}}).lean().exec(function(err,profiles){
		   // profiles = JSON.parse(JSON.stringify(profiles));
                    profiles.forEach(function(profile){
                      if(profile_map[profile.advertisment_entry_id]){
                        var obj = {};
                        obj.name = profile.meta_data.name;
                        obj.videoDownloadUrl = configurationHolder.config.videoUrl+profile.advertisment_entry_id+"/"+profile.transcoding_flavour_name;

                        profile_map[profile.advertisment_entry_id].push(obj)
                      }else {
                        profile_map[profile.advertisment_entry_id] = [];
                        var obj = {};
                        obj.name = profile.meta_data.name;
                        obj.videoDownloadUrl = configurationHolder.config.videoUrl+profile.advertisment_entry_id+"/"+profile.transcoding_flavour_name;

                        profile_map[profile.advertisment_entry_id].push(obj)
                      }
                    })

                    domain.Ad_View_History.find({
                        "userView._id": user._id,
                         complete_view: true,
                        ad_id: {
                                $in: result.getAdvertisementForUser.newAdvertismentIds
                            }
                      },{ad_id:1},function (err, seenAdvertisements) {
                         var newAdvertisementArray = [];
                if (seenAdvertisements.length) {
                    for (var i = 0; i < result.getAdvertisementForUser.length; i++) {
                        var seenFlag = true;
                        for (var j = 0; j < seenAdvertisements.length; j++) {

                            if (("" + result.getAdvertisementForUser[i]._id) == ("" + seenAdvertisements[j].ad_id) ){
                                seenFlag = false
                            }
                        }
                        if (seenFlag) {
                            newAdvertisementArray.push(result.getAdvertisementForUser[i]);
                        }
                    }
                } else {
                    newAdvertisementArray = result.getAdvertisementForUser;
                }
                        //Logger.info("Seen advertisement",seenAdvertisements.length);
                        var totalAdvertisements = makingAdvertismentObject(result.getAdvertisementForUser, user, newAdvertisementArray,seenAdvertisements,profile_map)
                        return callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.UserAdv, totalAdvertisements));
                    });
                })

            } else if (result.getAdvertisementForUser.length == 0) {
                var resObj = [];
                if(skip){
                  return callback(null,SetResponse.setSuccess(configurationHolder.Message.Success.UserNoAdvInPaggination, resObj));
                }
                else{
                  return callback(null,SetResponse.setSuccess(configurationHolder.Message.Success.UserNoAdv, resObj));
                }
            }
        });
       // });
}
/*This function is used to query for fectching adv. for app users.
@userAge @userGender it is user information  @skip @limit used for the paggination
*/
var queryForUserAdvertisement = function (userAge,userGender,skip,limit,callback) {
  //Logger.info("new value changed");
    // if(userAge!=0){ // Change according to Apple standards if user not provide any age at Reg. time
    if(1!=0){

    var todaydate = new Date();
    if(todaydate>new Date().setHours(18,30,0,0)){
      todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
      todaydate = todaydate.setHours(18,30,0,0);
    }else {
      todaydate = new Date().setHours(18,30,0,0)
    }
    domain.Advert.find({
        advert_status: 'ready',
        deleted: false,
        // "age_group.min_age": {
        //     $lte: userAge
        // },
        // "age_group.max_age": {
        //     $gte: userAge
        // },
        // $or: [{
        //     gender: userGender
        //         }, {
        //     gender: 'both'
        //   }],
        "schedule.end_date": {
          $gte:todaydate
            // $gte: new Date().setHours(18,30,0,0)
        },
        "schedule.start_date": {
          $lte:todaydate
            // $lte: new Date().setHours(18,30,0,0)
        }
    },{marital:1,client_details:1,comments:1,number_of_comments:1,number_of_likes:1,smil_file_name:1,advert_status:1,custom_thmbnail:1,thumbnail:1,advert_type:1,schedule:1,availablity_locality:1,gender:1,age_group:1,fileInformation:1,advert_sub_title:1,name_of_advert:1,description:1,current_like_bucket:1,number_of_times_complete_viewed:1,advert_url:1}
  ).skip(skip).limit(limit).populate("client_details._id", "logo_image_url client_org_name phonenumber").sort({
        "schedule.start_date": -1
    }).exec(function (err, object) {
      //Logger.info("object length :",object.length);
        if (err) {

           // //Logger.info("error in the queryForUserAdvertisement",err)
            return callback(err, null)
        } else {

             object.newAdvertismentIds = [];
        for (var i = 0; i < object.length; i++) {
            object.newAdvertismentIds.push(JSON.parse(JSON.stringify(object[i]._id)));
        }
           ////Logger.info(object);
           return callback(null, object);
        }
    });
}
else{// if user at Reg. time provide age

  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }

 domain.Advert.find({
        advert_status: 'ready',
        deleted: false,
        // "age_group.min_age":0,
        // "age_group.max_age":0,
        $or: [{
            gender: userGender
                }, {
            gender: 'both'
                }],
        "schedule.end_date": {
            $gte: todaydate//new Date().setHours(18,30,0,0)
        },
        "schedule.start_date": {
            $lte: todaydate//new Date().setHours(18,30,0,0)
        }
    }).skip(skip).limit(limit).populate("client_details._id", "logo_image_url client_org_name phonenumber").sort({
        "schedule.start_date": -1
    }).lean().exec(function (err, object) {
        if (err) {
            //Logger.info("error in the queryForUserAdvertisement",err)
            callback(err, null)
        } else {
            callback(null, object);
        }
    });



}
}
/*
It will provide new advertisement . we have to the new tag in every day uploaded advertisements
@userAge,userGender,userId these are information of user
@videoCountFlag: it will be used to call two different method if flag true then it will provide just provide videoCount of new video
otherwise it will provides new video with their information and return back getUserAdvertisement method
*/
var getNewAdvertisements = function (userAge, userGender, userId,videoCountFlag,callback) {
   // //Logger.info("control in the getNewAdvertisements", new Date().setHours(0, 0, 0, 0))
    async.auto({queryForNewAdvertisement:function(next,result){
        return queryForNewAdvertisement(userAge,userGender,next)
    }},function(err,result){
        var newAdvertisementObjects=result.queryForNewAdvertisement.newAdvertisementObjects;
        var newAdvertismentIds=result.queryForNewAdvertisement.newAdvertismentIds;
        domain.Ad_View_History.find({
            complete_view: true,
            ad_id: {
                $in: newAdvertismentIds
            },
            "userView._id": userId
        },{ad_id:1}).exec(function (err, seenAdvertisements) {
            ////Logger.info("total number of seen advertisement", seenAdvertisements.length);
            var newAdvertisementArray = [];
            if (seenAdvertisements.length) {
                for (var i = 0; i < newAdvertisementObjects.length; i++) {
                    var seenFlag = true;
                    for (var j = 0; j < seenAdvertisements.length; j++) {
                        if ("" + newAdvertisementObjects[i]._id == "" + seenAdvertisements[j].ad_id) {
                            seenFlag = false
                        }
                    }
                    if (seenFlag) {
                        newAdvertisementArray.push(newAdvertisementObjects[i]);
                    }
                }
            } else {
                newAdvertisementArray = newAdvertisementObjects;
            }
            var seenCount = seenAdvertisements.length;
            var newCount = newAdvertisementObjects.length;
            var videoCount = 0;
            if (newCount<= 3) {
                videoCount = newCount - seenCount
            } else if (newCount >= 4) {
                videoCount = 3 - seenCount;
            }
            if (videoCount < 0) {
                videoCount = 0;
            }
            if(videoCountFlag){
              return  callback(null, videoCount);
            }else{
             return callback(null, newAdvertisementArray);
            }
        });
    });
}
/*This function provides the query-for-new advertisement on daily basis.@userAge @userGender:used for user info.*/
var queryForNewAdvertisement=function(userAge,userGender,callback){
  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }
    domain.Advert.find({
        deleted: false,
        // "age_group.min_age": {
        //     $lte: userAge
        // },
        // "age_group.max_age": {
        //     $gte: userAge
        // },
        $or: [{
            gender: userGender
                }, {
            gender: 'both'
                }],
        advert_status: 'ready',
        "schedule.end_date": {
          $gte:todaydate
            // $gte: new Date().setHours(18,30,0,0)
        },
        "schedule.start_date": {
          $lte:todaydate
            // $lte: new Date().setHours(18,30,0,0)
        }
    }, {
        _id: 1
    }).lean().exec(function (err, newAdvertisementObjects) {
        //Logger.info("total number of new Advertismement", newAdvertisementObjects.length);
        var newAdvertismentIds = [];
        for (var i = 0; i < newAdvertisementObjects.length; i++) {
            newAdvertismentIds.push(newAdvertisementObjects[i]._id);
        }
        callback(err,{newAdvertisementObjects:newAdvertisementObjects,newAdvertismentIds:newAdvertismentIds});
    });
}
/*This method provides the count of new videos and used to show to count of new advertisements on home screen
@userObj:It contain information about the user which commes from auth-middleware */
AdvertService.prototype.getNewVideoCount = function (userObj, callback) {
  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }
  domain.Advert.find({
      deleted: false,
      $or: [{
        gender: userObj.gender
            }, {
        gender: 'both'
            }],
      advert_status: 'ready',
      "schedule.end_date": {
        $gte:todaydate
          // $gte: new Date().setHours(18,30,0,0)
      },
      "schedule.start_date": {
        $lte:todaydate
          // $lte: new Date().setHours(18,30,0,0)
      }
  }, {
      _id: 1
  }).lean().exec(function (err, adverts) {
      var newAdvertismentIds = adverts.map(function(advert){
        return advert._id;
      })

      domain.Ad_View_History.count({
            complete_view: true,
            ad_id: {
                $in: newAdvertismentIds
            },
            "userView._id": userObj._id
        }).exec(function (err, seenAdvertisementsCount) {
            var unseenCount = adverts.length - seenAdvertisementsCount;
            return callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.newVideoToWatch, unseenCount));
        });

  });
   // //Logger.info("control in the getNewVideoCount", userObj.name)
    // var getNewAdvertisment = sync(getNewAdvertisements);
    // sync.fiber(function () {
    //     videoCount=getNewAdvertisment(userObj.age, userObj.gender, userObj._id,true);
    //       //Logger.info("video to count ",videoCount);
    //      return callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.newVideoToWatch, videoCount));
    //     });

}
/*This method used to generate the video smil file,image url path,add new symbol on the new advertisement and add seen advertisement
symbol of seen ad and also differancite the @object:it contains the total advertisements @user:It contains user information
@newAdvertArray:This array contains new advertisements which helps for new tags @seenAdvertisement:This array contains the seen advertisement which helps for seen tags */
var makingAdvertismentObject = function (object, user, newAdvertisementArray,seenAdvertisements, profile_map) {
    ////Logger.info(object.length, "total number of new advertisement", newAdvertisementArray.length)
    var resObject = [];
    var newAdvert=[];
    //Logger.info("complete no of views ",seenAdvertisements.length);
    for (var i = 0; i < object.length; i++) {
        var userAdvObject = {}
        if (object[i].advert_type == 'Video') {
            if (object[i].custom_thmbnail) {
                userAdvObject.thumbnailURL = object[i].custom_thmbnail;
            } else {
              //  //Logger.info("Check =================================================================================3");
                ////Logger.info("URL========================================",configurationHolder.config.thumbnail_URL);
                userAdvObject.thumbnailURL = configurationHolder.config.thumbnail_URL + object[i].fileInformation.entry_id + "/" + object[i].thumbnail;
             // //Logger.info("THUMBANAIL URL =======================",userAdvObject.thumbnailURL);
          // //Logger.info("configurationHolder.config.imageUrl =======================",configurationHolder.config.thumbnail_URL);

            }
            userAdvObject.smilURL = configurationHolder.config.smile_URL + object[i].fileInformation.entry_id + "/" + "smil:" + object[i].smil_file_name + "/" + "playlist.m3u8";
        } else {
            userAdvObject.thumbnailURL = configurationHolder.config.thumbnail_URL + object[i].fileInformation.entry_id + "/" + object[i].thumbnail;
            userAdvObject.imageURL = configurationHolder.config.thumbnail_URL + object[i].fileInformation.entry_id + "/" + object[i].fileInformation.fileName;
        }
        for (var j = 0; j < newAdvertisementArray.length; j++) {
            if ("" + object[i]._id == "" + newAdvertisementArray[j]._id) {
                userAdvObject.newAdvertisement = true;
                ////Logger.info('matched')
            }
        }
        for(var k=0;k<seenAdvertisements.length;k++){
            if(""+object[i]._id==""+seenAdvertisements[k].ad_id){
                userAdvObject.seenAdvertisement=true;
                ////Logger.info('seen');
            }
        }

      if(object[i].advert_type == 'Video'){
              // userAdvObject.videoDownloadUrl = configurationHolder.config.videoUrl+object[i].smil_file_name.replace('.smil','')+"/"+object[i].smil_file_name.replace('.smil','_source.mp4');
              userAdvObject.videoDownloadUrl = configurationHolder.config.videoUrl+object[i].smil_file_name.replace('.smil','')+"/"+object[i].fileInformation.fileName;//object[i].smil_file_name.replace('.smil','_source.mp4');
              var flavoursArr = [];
              var smil_file_name = object[i].smil_file_name;

              var flavoursArr = profile_map[object[i].fileInformation.entry_id]
              //userAdvObject.flavours = flavoursArr;
        }
        userAdvObject.advName = object[i].name_of_advert;
        userAdvObject.subTitle = object[i].advert_sub_title;
        userAdvObject.description = object[i].description;
        userAdvObject.advType = object[i].advert_type;
        userAdvObject.number_of_likes = object[i].number_of_likes;
        userAdvObject.entry_id = object[i].fileInformation.entry_id;
        userAdvObject.comments = object[i].comments;
        userAdvObject.number_of_comments = object[i].number_of_comments;
        userAdvObject.schedule = object[i].schedule;
        userAdvObject.clientName = object[i].client_details.name;
        userAdvObject.logo_image_url = object[i].client_details._id.logo_image_url;
        userAdvObject.client_org_name = object[i].client_details._id.client_org_name;
        userAdvObject.number_of_times_complete_viewed=object[i].number_of_times_complete_viewed;
        userAdvObject.client_phonenumber = object[i].client_details._id.phonenumber;
        userAdvObject.advert_url = object[i].advert_url;

        if (object[i].current_like_bucket) {
            var like_by_user = object[i].current_like_bucket.like_by_users;
            userAdvObject.likeFlag = (like_by_user.indexOf(user._id)) >= 0 ? true : false;
        } else {
            userAdvObject.likeFlag = false;
        }
        if(userAdvObject.newAdvertisement){
            newAdvert.push(userAdvObject)
        }else{
             resObject.push(userAdvObject)
        }
    }
    return  newAdvert.concat(resObject)
}
/*
It follows the buckets base conncept for comments on advertisements
@object:it contains advertisement id,entry id,comments
*/
AdvertService.prototype.commentOnAdvertisement = function (object, callback) {
    //Logger.info("control in the comment service layer", object);
    var bucketSizeofComment = 1000;
    domain.Advert.findOne({"fileInformation.entry_id": object.entryid,deleted: false}).exec(function (err, advertObject) {
        domain.Comment_History.count({ad_id: advertObject._id,current_bucket_count: {$lt: bucketSizeofComment}
        }).exec(function (err, commentHistroyObject) {
            if (commentHistroyObject != 0) {
                var totalBuckets = commentHistroyObject.length;
                //Logger.info("total number of bucket", totalBuckets);
                addTheCommentInBucket(advertObject,object,callback);
            } else {
                //Logger.info("control in the firstime comment in advertisement");
                createNewBucketForcomments(advertObject._id, object._id, object.comment, callback);
            }
        });
    });
}
/*This function is used to add the comment in the comment bucket @advertObject:advertisement comment @object:comment object information*/
var addTheCommentInBucket = function (advertObject,object,callback) {
    domain.Comment_History.findOneAndUpdate({
            _id: advertObject.current_comment_bucket,
        }, {
            $push: {
                comments: {user: object._id,comment: object.comment}
            },
            $inc: {current_bucket_count: 1}
        }, {new: true},
        function (err, commentHistroyObject) {
            domain.Advert.findOneAndUpdate({"fileInformation.entry_id": object.entryid,deleted: false},
            {$inc: {number_of_comments: 1}
            },{new: true}, function (err, adobj) {
                // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
                sendCommentList(object._id, advertObject._id, callback);
            });
        });

}
/* when the bucket size increase then new bucket is created for advertisements and link with advertisments
@ad_id:advertisement object id @user_id:user object id, @comment:comments which is sent by app users */
var createNewBucketForcomments = function (ad_id, user_id, comment, callback) {
    //Logger.info("control in the create new bucket ");
    var commentBucketObj = new domain.Comment_History({
        ad_id: ad_id,
        current_bucket_count: 1,
        comments: [{
            user: user_id,
            comment: comment
        }]
    });
    commentBucketObj.save(function (err, saveObject) {
        domain.Advert.findOneAndUpdate({ "_id": ad_id,deleted: false}, {
            $push: {
                comment_bucket_ids: {
                    _id: saveObject._id
                }
            },
            $inc: {
                number_of_comments: 1,
                total_comment_bucket: 1
            },
            current_comment_bucket: saveObject._id
        }, {new: true}, function (err, object) {
            // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
            sendCommentList(user_id, ad_id, callback);
        })
    });
}
/* It will provide the list of comments on advertisements. @entryid:it is advertisement unique id and used to find advertisements */
AdvertService.prototype.getCommentService = function (user_id, entryid, callback) {
    //Logger.info("control in the get comments service");
    domain.Advert.findOne({"fileInformation.entry_id": entryid,deleted: false},
    {_id:1,client_details:1,cost_per_view:1,advert_type:1,fileInformation:1}).exec(function (err, advertObj) {
        sendCommentList(user_id, advertObj._id, callback)
    });
}
/* It will provide the list of comments and fetch from comment-buckets  @ad_id:advertObjectId */
var sendCommentList = function (user_id, ad_id, callback) {
    //Logger.info("control in the send comment list");
    domain.Advert.findOne({"_id": ad_id,deleted: false}, {
        number_of_comments: 1,
        comment_bucket_ids: 1,
        "fileInformation.entry_id": 1
    }).populate("comment_bucket_ids").exec(function (err, advertismentObject) {
        var object = {};
        // object.number_of_comments = advertismentObject.number_of_comments;
        object.entry_id = advertismentObject.fileInformation.entry_id;
        object.comments = [];
        var totalbucket = advertismentObject.comment_bucket_ids.length;
        //Logger.info("total bucket", totalbucket);
        for (var i = 0; i < totalbucket; i++) {
            var totalcommentinbucket = advertismentObject.comment_bucket_ids[i].comments.length;
            //Logger.info(i, "totalcommentinbukcet", totalcommentinbucket);
            var counter = 0;
            for (var j = 0; j < totalcommentinbucket; j++) {
              // Logger.info("the userids are",user_id, advertismentObject.comment_bucket_ids[i].comments[j].user._id);
              // Logger.info("the userids are",user_id, JSON.stringify(advertismentObject.comment_bucket_ids[i].comments[j].user._id));

              if(JSON.stringify(user_id) == JSON.stringify(advertismentObject.comment_bucket_ids[i].comments[j].user._id)){
                var commentObj = {};
                counter++;
                if (advertismentObject.comment_bucket_ids[i].comments[j].user.image_url) {
                    commentObj.image_url = advertismentObject.comment_bucket_ids[i].comments[j].user.image_url;
                }
                commentObj.comment_id = advertismentObject.comment_bucket_ids[i].comments[j]._id;
                commentObj.name = advertismentObject.comment_bucket_ids[i].comments[j].user.name;
                commentObj.comment = advertismentObject.comment_bucket_ids[i].comments[j].comment;
                commentObj.date = advertismentObject.comment_bucket_ids[i].comments[j].date;
                commentObj.bucket_id = advertismentObject.comment_bucket_ids[i]._id;
                commentObj.isDeleted = advertismentObject.comment_bucket_ids[i].comments[j].isDeleted;
                commentObj.user_id = advertismentObject.comment_bucket_ids[i].comments[j].user;
                object.number_of_comments = counter;
                object.comments.push(commentObj);
              }

            }
        }
        return callback(err, SetResponse.setSuccess("reviews", object));
    });
}
/*
It will used to increment the likes of advertisements and also sends the like flag user likes this advertisement
@ad_id:advertisement object @likeUserId:object id of user who likes the video @entryId:advertsement unique id
*/
var likeTheAdvertisement = function (ad_id,likeUserId,entryId,callback) {
    domain.Like_History.findOneAndUpdate({
        ad_id: ad_id
    }, {
        $push: {
            like_by_users: likeUserId
        }
    }, function (err, obj) {
        domain.Advert.findOneAndUpdate({
                "fileInformation.entry_id": entryId
            }, {
                $inc: {
                    number_of_likes: 1
                }
            }, {new: true},
            function (err, object) {
              // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
                callback(err, SetResponse.setSuccess("like", {
                    number_of_likes: object.number_of_likes,
                    entry_id: object.fileInformation.entry_id,
                    likeFlag: true
                }));
            });
    });
}
/*
It remove the like of advertisement when user press like agian and also sents the flag of remove like
It will used to increment the likes of advertisements and also sends the like flag user likes this advertisement
@ad_id:advertisement object @likeUserId:object id of user who likes the video @entryId:advertsement unique id */
var removeLikeTheAdvertisement = function (ad_id,likeUseId,entryId,callback) {
  // Logger.info("inside remove like");
    domain.Like_History.findOneAndUpdate({
        ad_id: ad_id
    }, {
        $pull: {
            like_by_users: likeUseId
        }
    }, function (err, obj) {
      // Logger.info("the res is",err,obj);
        domain.Advert.findOneAndUpdate({
                "fileInformation.entry_id": entryId,
                number_of_likes:{$gte:1}
            }, {
                $inc: {
                    number_of_likes: -1
                }
            }, {
                new: true
            },
            function (err, object) {
              if(!err && object){
                // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
                callback(err, SetResponse.setSuccess("unlike", {
                    number_of_likes: object.number_of_likes,
                    entry_id: object.fileInformation.entry_id,
                    likeFlag: false
                }));
              }else {
                callback(err, SetResponse.setSuccess("unlike", {
                    number_of_likes: 0,
                    entry_id: entryId,
                    likeFlag: false
                }));
              }

            });
    });
}
/*
This methods like or unlike the advertsement.It also differantciate the likeTheAdvertisement(for like)
or removeLikeTheAdvertisement(for remove like)  @mainObject:it contains ad_id,entryid,user_id */
AdvertService.prototype.likeUnlikeServcie = function (mainObject, callback) {
    //Logger.info("control in the likeunlike service", mainObject);
    domain.Advert.findOne({
        "fileInformation.entry_id": mainObject.entryid
    },{_id:1,client_details:1,cost_per_view:1,advert_type:1,fileInformation:1}).lean().exec(function (err, advertObject) {
        domain.Like_History.count({
            ad_id: advertObject._id,
        }).exec(function (err, likeHistroyObject) {
            if (likeHistroyObject>0) {
                domain.Like_History.findOne({
                    ad_id: advertObject._id,
                    like_by_users: mainObject._id
                }, function (err, likeObject) {
                    if (!likeObject) {
                        //Logger.info("control for like");
                        likeTheAdvertisement(advertObject._id, mainObject._id, mainObject.entryid, callback);
                    } else {
                        //Logger.info("control in the unlike", likeObject.toString());
                        removeLikeTheAdvertisement(advertObject._id, mainObject._id, mainObject.entryid, callback)
                    }
                });
            } else {
                //Logger.info("control in the first time like in video");
                createNewBucketForLikes(advertObject._id, mainObject._id, callback);
            }
        });
    });
}
/*
It will store the likes bucket of advertisements.All likes of advertisement store in different domain.
@ad_id:advertisement object id
@user_id:user object id
*/
var createNewBucketForLikes = function (ad_id, user_id, callback) {
    //Logger.info("control in the create new bucket for likes", ad_id, user_id);
    var newLikeHistoryobject = new domain.Like_History({
        ad_id: ad_id,
        like_by_users: [user_id]
    });
    newLikeHistoryobject.save(function (err, saveObject) {
        domain.Advert.findOneAndUpdate({
            "_id": ad_id,
            deleted: false
        }, {
            $inc: {
                number_of_likes: 1,
            },
            current_like_bucket: saveObject._id
        }, {
            new: true
        }, function (err, object) {
          // CacheManagingService.prototype.updateMongoCollectionCache("adverts");
            callback(err, SetResponse.setSuccess("like", {
                number_of_likes: object.number_of_likes,
                entry_id: object.fileInformation.entry_id,
                likeFlag: true
            }));
        });
    });
}
/*
when user clicks the advertisements links then it will count the click on count of advertisements because client pays to
user to click on count.
@mainObject:It contains entry id,object id of advertisements and also user_id
This method also contains the history of the click on count.
*/
AdvertService.prototype.clickOnCountService = function (mainObject, callback) {
    //Logger.info("control in the click on count service", mainObject);
    domain.Advert.findOne({
        "fileInformation.entry_id": mainObject.entryid,
        deleted: false
    },{_id:1,client_details:1,cost_per_view:1,advert_type:1,fileInformation:1}).lean().exec(function (err, advertObj) {
        if (advertObj) {
            domain.Ad_Click_History.count({
                ad_id: advertObj._id,
                "user._id": mainObject.user._id
            }, function (err, clickhistoryobj) {
                if (clickhistoryobj<1) {
                    var adhistroyobj = new domain.Ad_Click_History({
                        ad_id: advertObj._id,
                        client_details: advertObj.client_details,
                        client_charged_for_click: advertObj.cost_per_click,
                        user: mainObject.user
                    });
                   saveClickOnCountObject(adhistroyobj,mainObject,callback)
                } else {
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.clickAgain, null));
                }
            });
        }
    });
}
/*This Function is used to save the clickOnCount object and also change the advertisement count.*/
var saveClickOnCountObject= function (adhistroyobj,mainObject,callback) {
    adhistroyobj.save(function (err, saveHistroyObject) {
        if (saveHistroyObject) {
            domain.Advert.findOneAndUpdate({
                "fileInformation.entry_id": mainObject.entryid,
            }, {
                $inc: {
                    number_of_times_link_clicked: 1
                }
            }, {
                new: true
            }, function (err, adobj) {
                callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.clicked, {
                    number_of_times_link_clicked: adobj.number_of_times_link_clicked
                }));
            });
        } else {
            //Logger.info("error in occure");
            //Logger.info(err);
            callback(err, null);
        }
    });
}
/* It will be used to for maintain the history of normal view of advertisements.It hit of user on advertisement is new then create the new documents otherwise it will sent the view again message.
@mainObject:it contains entry id,ad_id of advertisement and also contains the log,lat,user id etc */
AdvertService.prototype.adViewService = function (mainObject, callback) {
    // Logger.info("control in the ad view service", mainObject);
    domain.Advert.findOne({
        "fileInformation.entry_id": mainObject.entryid,
        deleted: false
    },{_id:1,client_details:1,cost_per_view:1,advert_type:1,fileInformation:1}).lean().exec(function (err, advertObj) {
        if (advertObj) {
            domain.Ad_View_History.count({
                ad_id: advertObj._id,
                "userView._id": mainObject.user._id
            }).exec(function (err, viewhistoryobj) {
                if (viewhistoryobj<1) {
                  if(advertObj.advert_type=='Image'){
                    var adViewObj = {
                        ad_id: advertObj._id,
                        client_details: advertObj.client_details,
                        client_charged_for_view: advertObj.cost_per_view,
                        userView: mainObject.user,
                        complete_view:true,
                        ad_type: advertObj.advert_type
                    };
                  }else if(advertObj.advert_type=='Video'){
                    var adViewObj = {
                        ad_id: advertObj._id,
                        client_details: advertObj.client_details,
                        client_charged_for_view: advertObj.cost_per_view,
                        userView: mainObject.user,
                        complete_view:false,
                        ad_type: advertObj.advert_type
                    };
                  }
                   var adhistroyobj = new domain.Ad_View_History(adViewObj);
                   saveAdViewObject(adhistroyobj,mainObject,advertObj.advert_type,callback)
                } else {
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.viewAgain, null));
                }
            });
        }else {
            callback(err, SetResponse.setSuccess("Some error occured", null));
        }
    });
}
/*This function is used to save the adViewHistoryObject and change the advert. normal view count*/
var saveAdViewObject= function (adhistroyobj,mainObject,advert_type,callback) {
    adhistroyobj.save(function (err, saveHistroyObject) {
      // Logger.info("the res is",err,saveHistroyObject);
        if (saveHistroyObject) {
          if(advert_type=='Image'){
            var updateObj = {
                number_of_times_viewed: 1,
                number_of_times_complete_viewed:1
            }
          }else {
            var updateObj = {
                number_of_times_viewed: 1
            }
          }
            domain.Advert.findOneAndUpdate({
                "fileInformation.entry_id": mainObject.entryid,
            }, {
                $inc: updateObj
            }, {
                new: true
            }, function (err, adobj) {
                return callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.viewed, {
                    number_of_times_viewed: adobj.number_of_times_viewed
                }));
            });
        } else {
            //Logger.info("error in occure");
            //Logger.info(err);
            return callback(err, null);
        }
    });
}
/*
when user views completes the advertisements then status of ad_view_history is changes and user is able to get the ammount of advertisement.
@mainObject:it contains the ad_id,entry_id,user_id
*/
AdvertService.prototype.completeViewService = function (mainObject, callback) {
    //Logger.info("control in the completeViewservice", mainObject);
    domain.Advert.findOne({"fileInformation.entry_id": mainObject.entryid,deleted: false},{_id:1,client_details:1,cost_per_view:1,advert_type:1,fileInformation:1,number_of_times_complete_viewed:1}).lean().exec(function (err, advertObj) {
        if (advertObj) {
          if(advertObj.advert_type=='Image'){
            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.completeView, {
                number_of_times_viewed: advertObj.number_of_times_complete_viewed
            }));
          }else {
            domain.Ad_View_History.count({ad_id: advertObj._id,"userView._id": mainObject._id,complete_view: false
            }, function (err, viewhistoryobj) {
                if (viewhistoryobj>0) {
                   completeViewChangesStatus(advertObj,mainObject,callback);
                } else {
                    callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.completeviewAgain, null));
                }
            });
          }
        }
    });
}
/*This function change the status of complete view and also increment the count of ad_view_history*/
var completeViewChangesStatus = function (advertObj,mainObject,callback) {
    domain.Ad_View_History.findOneAndUpdate({ad_id: advertObj._id,"userView._id": mainObject._id,complete_view: false}, {
        complete_view: true,
        date: new Date()
    }, {
        new: true
    }, function (err, completeviewObject) {
        domain.Advert.findOneAndUpdate({
            "fileInformation.entry_id": mainObject.entryid,
        }, {
            $inc: {
                number_of_times_complete_viewed: 1,
                duration_of_view: advertObj.fileInformation.duration_time
            }
        }, {
            new: true
        }, function (err, adObj) {
            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.completeView, {
                number_of_times_viewed: adObj.number_of_times_complete_viewed
            }));
        });
    });
}

AdvertService.prototype.show_all_comments = function (data, callback) {
    var advertisement_id = data.advertisement_id;
    // domain.Comment_History.find({ad_id:advertisement_id}).populate('comments.$.user').exec(function(err,obj){
    //   if(!err){
    //     //Logger.info("the response is",obj);
    //     callback(null,SetResponse.setSuccess("success"),{comments:obj});
    //   }else {
    //     callback(new Error("Internal Server Error"));
    //   }
    // })
    domain.Advert.findOne({_id: advertisement_id,deleted: false}, {
        number_of_comments: 1,
        comment_bucket_ids: 1,
        "fileInformation.entry_id": 1
    }).populate("comment_bucket_ids").exec(function (err, advertismentObject) {
        //Logger.info("the res is",err,advertismentObject);
        if(!err && advertismentObject){
          var object = {};
          object.number_of_comments = advertismentObject.number_of_comments;
          object.entry_id = advertismentObject.fileInformation.entry_id;
          object.comments = [];
          var totalbucket = advertismentObject.comment_bucket_ids.length;
          //Logger.info("total bucket", totalbucket);
          for (var i = 0; i < totalbucket; i++) {
              var totalcommentinbucket = advertismentObject.comment_bucket_ids[i].comments.length;
              //Logger.info(i, "totalcommentinbukcet", totalcommentinbucket);
              for (var j = 0; j < totalcommentinbucket; j++) {
                  var commentObj = {};
                  if (advertismentObject.comment_bucket_ids[i].comments[j].user.image_url) {
                      commentObj.image_url = advertismentObject.comment_bucket_ids[i].comments[j].user.image_url;
                  }
                  commentObj._id = advertismentObject.comment_bucket_ids[i].comments[j]._id;
                  commentObj.name = advertismentObject.comment_bucket_ids[i].comments[j].user.name;
                  commentObj.comment = advertismentObject.comment_bucket_ids[i].comments[j].comment;
                  commentObj.date = advertismentObject.comment_bucket_ids[i].comments[j].date;
                  commentObj.bucket_id = advertismentObject.comment_bucket_ids[i]._id;
                  commentObj.isDeleted = advertismentObject.comment_bucket_ids[i].comments[j].isDeleted;
                  object.comments.push(commentObj);
              }
          }
          callback(err, SetResponse.setSuccess("comments", object));
        }else {
          var object = null
          callback(err, SetResponse.setSuccess("comments", object));
        }

    });
}

AdvertService.prototype.addComment = function (user, object, callback) {
    //Logger.info("control in the comment service layer", object);
    var bucketSizeofComment = 10000;
    domain.Advert.findOne({"fileInformation.entry_id": object.entryid,deleted: false}).lean().exec(function (err, advertObject) {
        domain.Comment_History.find({ad_id: advertObject._id,current_bucket_count: {$lt: bucketSizeofComment}
        }).lean().exec(function (err, commentHistroyObject) {
            if (commentHistroyObject.length != 0) {
                var totalBuckets = commentHistroyObject.length;
                //Logger.info("total number of bucket", totalBuckets);
                addTheCommentAndGetId(user, advertObject,object,callback);
            } else {
                //Logger.info("control in the firstime comment in advertisement");
                createNewBucketForcomments(advertObject._id, object._id, object.comment, callback);
            }
        });
    });
}

var addTheCommentAndGetId = function (user, advertObject,object,callback) {
    domain.Comment_History.findOneAndUpdate({
            _id: advertObject.current_comment_bucket,
        }, {
            $push: {
                comments: {user: object._id,comment: object.comment}
            },
            $inc: {current_bucket_count: 1}
        }, {new: true},
        function (err, commentHistoryObject) {
            domain.Advert.findOneAndUpdate({"fileInformation.entry_id": object.entryid,deleted: false},
            {$inc: {number_of_comments: 1}
            },{new: true}, function (err, adobj) {
                sendLatestCommentWithId(user, object._id, adobj,  commentHistoryObject, callback);
            });
        });

}

var sendLatestCommentWithId = function(user, user_id, advert, commentHistory, callback){
  // Logger.info("the commmmm",commentHistory.comments[commentHistory.comments.length-1]);
  var commentObj = commentHistory.comments[commentHistory.comments.length-1];
  var resObj = {};
  resObj.entry_id = advert.fileInformation.entry_id;
  resObj.number_of_comments = 1;
  resObj.comments = [];
  var comment = {};


  comment.comment_id = commentObj._id;//advertismentObject.comment_bucket_ids[i].comments[j]._id;
  comment.name = user.name;
  comment.image_url = user.image_url;
  comment.user_id = {_id:user_id, name:user.name, image_url:user.image_url};
  comment.comment = commentObj.comment;
  comment.date = commentObj.date;
  comment.bucket_id =  commentHistory._id;
  comment.isDeleted = false;

  resObj.comments.push(comment);
  return callback(null, SetResponse.setSuccess("comments", resObj));

}

module.exports = function (app) {
    return new AdvertService(app);
};
