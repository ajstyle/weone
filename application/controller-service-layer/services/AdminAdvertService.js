var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
AdminAdvertService = function (app) {
    this.app = app;
};

AdminAdvertService.prototype = new BaseService();
/*it will be used to count total number of user in application*/
var totalNumberOfUser = function (callback) {
    domain.User.count({
        deleted: false,
        role: 'ROLE_USER'
    }, function (err, userCount) {
        //Logger.info("no of users", userCount);
        callback(null,{userCount:userCount})
    });
}
/*it will be used to count total number of advertisement in application*/
var totalNumberOfAdvertisements = function (callback) {
    domain.Advert.count({
        deleted: false,
        advert_status: 'ready'
    }, function (err, advertCount) {
        //Logger.info("no of advert", advertCount);
        callback(null,{advertCount:advertCount})
    });
}

/*This method total user,total advertisements,client Charges,top clients by charges,top advertisements . This method run all methods in parallel,display all information on dashboard */
AdminAdvertService.prototype.getDashboardData = function (callback) {

    async.parallel([totalNumberOfUser, totalNumberOfAdvertisements], function (err, result) {
        var dashBoardObject = {};
        if(result[0].userCount)
        dashBoardObject.totalUser = result[0].userCount;
        if(result[1].advertCount)
        dashBoardObject.totalAdvertisement = result[1].advertCount;
        callback(err, SetResponse.setSuccess("total users and earning", dashBoardObject));
    });
}
/*This method used to create the smil-file-url for video and image-file-url for  image
@objectArray:this array had advertisement information
*/
var createURL = function (objectArray) {
    //Logger.info("thumbnail", objectArray.length)
    for (var i = 0; i < objectArray.length; i++) {
        var object = {};
        if (objectArray[i].thumbnail) {
            object.thumbnailurl = configurationHolder.config.imageUrl + "video/" + objectArray[i].fileInformation.entry_id + '/' + objectArray[i].thumbnail;
            //Logger.info("THUMBANAIL URL =======================",object.thumbanailurl);
           //Logger.info("configurationHolder.config.imageUrl =======================",configurationHolder.config.imageUrl);
            objectArray[i].thumbnail = object.thumbnailurl;
        }
        if (objectArray[i].smil_file_name) {
            object.smil_file_name = configurationHolder.config.smile_URL + objectArray[i].fileInformation.entry_id + "/" + 'smil:' + objectArray[i].smil_file_name + "/jwplayer.smil";
            objectArray[i].smil_file_name = object.smil_file_name;
        }
    }
    return objectArray;
}
/*It used to display the user location on dashboard state wise. */
AdminAdvertService.prototype.getUserLocations = function (callback) {
    //Logger.info("control in get user location service");
    domain.User.aggregate([{
        $match: {
            deleted: false,
            role: 'ROLE_USER'
        }
    }, {
        $group: {
            _id: "$location.state",
            totalusers: {
                $sum: 1
            }
        }
    }], function (err, loctionObect) {
        callback(err, SetResponse.setSuccess("total users", loctionObect));
    });
}
/*
This function is used for searching the advertisements and implements the regex based searching
@name:This is searching parameter for advertisements
@limit @skip for paggination
*/
AdminAdvertService.prototype.searchAdvertisement = function (name, limit, skip, callback) {
    //Logger.info(name, "control in the search advertisement ", skip, limit);
    var object = {};
    var query = domain.Advert.find({
      deleted:false,
        $or: [{
            name_of_advert: {$regex: name,$options:'i'}
            }, {
            advert_type: {$regex: name,$options:'i'}
          }]
    });
    if (skip != 0) {
        query.limit(limit).skip(skip).sort({
            name_of_advert: 1
        }).exec(function (err, obj) {
            object.object = createURL(obj);
            callback(err, SetResponse.setSuccess("", object));
        });
    } else {
        domain.Advert.find({
          deleted:false,
            $or: [{
                name_of_advert: new RegExp(name)
            }, {
                advert_type: new RegExp(name)
            }]
        }).count(function (err, count) {
            //Logger.info("count", count);
            object.count = count;
            query.limit(limit).skip(skip).sort({
                name_of_advert: 1
            }).exec(function (err, obj) {
                object.object = createURL(obj);
                callback(err, SetResponse.setSuccess("", object));
            });
        });
    }
}
/*
This method is used edit the advertisement information and also change the status of the advertisement according to date
@advertObject:this object contain the updated value of advertisement
@advertid:this contains the advertisement id
*/
AdminAdvertService.prototype.editAdvertisement = function (advertObject, advertid, callback) {
    //Logger.info(advertObject.schedule.end_date, "control in the editAdvertisement serviceLayer", advertObject.schedule.start_date);
    domain.Advert.findOne({
        _id: advertid,
        deleted: false
    }, function (err, advertObjet) {
        if (advertObjet.advert_status != "expired") {
            if (advertObjet.advert_status == 'ready' || advertObjet.advert_status == 'schedule') {
                if (new Date(advertObject.schedule.start_date) <= new Date()) {
                   // Logger.info("ready");
                    advertObject.advert_status = "ready";
                } else {
                    advertObject.advert_status = "schedule";
                    //Logger.info("schedule");
                }
            }
        } else {
            //Logger.info("control in the expired")
            if (new Date(advertObject.schedule.end_date) >= new Date().setHours(0, 0, 0, 0)) {
                if (new Date(advertObject.schedule.start_date) <= new Date()) {
                    //Logger.info("ready");
                    advertObject.advert_status = "ready";
                } else {
                    advertObject.advert_status = "schedule";
                    //Logger.info("schedule");
                }
            }
        }
        domain.Advert.findOneAndUpdate({
            _id: advertid,
            deleted: false
        }, advertObject, {
            new: true
        }, function (err, adObject) {
            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.advertismentUpdate, adObject));
        });
    });
}
/*it will get all the advertisement for admin pannel with paggination
@limit:it is used to limit the number of records
@skip:it is used to skip the number of records
*/
AdminAdvertService.prototype.getAllAdvertisement = function (limit, skip, callback) {
    //Logger.info(limit, 'control in the getAllAdvertisement service', skip);
    var object = {};
    if (skip != 0) {
        domain.Advert.find({
            deleted: false
        },{comment_bucket_ids:0,current_like_bucket:0}).skip(skip).limit(limit).sort({
            _id: -1
        }).exec(function (err, obj) {
            object.object = createURL(obj);
            callback(err, SetResponse.setSuccess("", object));
        });
    } else {
      // Logger.info("skip and limit",skip,limit);
        domain.Advert.count({
            deleted: false
        },function (err, count) {
            object.count = count;
            domain.Advert.find({
                deleted: false
            },{comment_bucket_ids:0,current_like_bucket:0}).skip(skip).limit(limit).sort({
                _id: -1
            }).exec(function (err, obj) {
              // Logger.info("the lenght is",obj.length);
                object.object = createURL(obj);
                callback(err, SetResponse.setSuccess("", object));
            });
        });
    }
}
/*
This can help to soft delete the advertisement
@advertid:it contains the advertisement object id
*/
AdminAdvertService.prototype.deleteAdvertisement = function (advertId, callback) {
    //Logger.info("control in the delete advertisement service layer", advertId);
    domain.Advert.findOne({
        _id: advertId,
        deleted: false
    }, function (error, object) {
        if (object) {
            object.softdelete(function (err, deletedObject) {
                callback(err, SetResponse.setSuccess("", deletedObject));
            })
        } else {
            callback(null, SetResponse.setSuccess("error in server", null));
        }
    });
};
/*
it will save the data of advertisement without information of video information
@advert:it is advertisement object
*/
AdminAdvertService.prototype.saveAdvertisement = function (advert, callback) {
    //Logger.info("control in the service of advertisement save");
    var advertObj = new domain.Advert(advert);
    advertObj.save(function (err, adObj) {
        if (err) {
            //Logger.info("Error in saving advert..", err)
        } else {
            var videoUploadTokenObj = new domain.Video_Upload_Token({
                authToken: uuid.v1(),
                advert_type: adObj.advert_type,
                advert_id: adObj._id,
                name_of_advert: adObj.name_of_advert
            });
            videoUploadTokenObj.save(function (err, authObj) {
                callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.advertismentUpload, authObj));
            });
        }
    });
}
/*it will save the data of advertisement with all the media information
@advert:advertisement object
@ad_id:advertisement object id @filePath:path of file from request
@path:advertisement path @advert:advertisement object @fileInformation:information about media
*/
AdminAdvertService.prototype.uploadVideoService = function (path,filePath, serverPath, advert, fileInformation, ad_id, callback) {
    //Logger.info(serverPath,"control in the service of upload video", ad_id);
    async.auto({
        generateThumbnail:function(next,result){
            return generateThumbnailForAd(path,filePath, serverPath, advert, fileInformation,next)
        }
    },function(err,result){
     //Logger.info("Control in the result",result.generateThumbnail)
      domain.Advert.findOneAndUpdate({
        _id: ad_id,
        deleted: false
    }, result.generateThumbnail, {
        new: true
    }, function (err, adObject) {
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.advertismentUpload, adObject));
    });
    })
}
/*
This method is used to generate the thumbnail for advertisement whether media is image or video
@advert:advertisement object
@filePath:path of file from request
@path:advertisement path @advert:advertisement object
@fileInformation:information about media
*/
var mv = require('mv');

var generateThumbnailForAd = function (path,filePath, serverPath, advert, fileInformation,callback) {
    mv(
        filePath, serverPath,
        function (err) {
            if (err) {
                callback(new Error("Something Went Wrong"))
            } else {
                //Logger.info('advertisement is uploaded successfully');
                file.chmod(serverPath, 0777)
                // callback(null, advert);
                // if(1!=1){
                if (advert.advert_type == 'Video') {
                    ffmpeg.ffprobe(serverPath, function (err, metadata) {
                        //Logger.info("duration", metadata.format.duration);
                        fileInformation.duration_time = metadata.format.duration;
                        ffmpeg(serverPath).screenshots({
                            count: 1,
                            folder: path,
                            filename: fileInformation.entry_id + '_thumbnail.png',
                            size: '320x240'
                        }).on('end', function () {
                            //Logger.info("thumbnail generated successfully and save into the object");
                            advert.thumbnail = fileInformation.entry_id + '_thumbnail.png';
                            //Logger.info(advert);
                            callback(null, advert);
                        }).on('error', function (error) {
                            //Logger.info("errror in ffmpeg");
                            //Logger.info(error);
                        });
                    });
                } else {
                    advert.thumbnail = fileInformation.entry_id + '_thumbnail.' + "jpg";
                    //Logger.info("control in the image condition");
                    gm(serverPath)
                        .write(path + '/' + advert.thumbnail, function (err) {
                            if (!err) callback(null, advert);
                            else  Logger.info("error in the image upload in advertisement",err)
                        });
                }
            }
        });
}

AdminAdvertService.prototype.getLocationsAndCities = function (advert_id,skip,limit, callback) {
    //Logger.info("the advert is",advert_id);
    var resData = {};
    domain.Ad_View_History.aggregate([{$match: {
            ad_id : mongoose.Types.ObjectId(advert_id)
        }
    }, {
        $group: {
            _id: {
              user:"$userView._id",
              location:"$userView.location"
            },
            totalusers: {
                $sum: 1
            }
        }
    }])
    .skip(skip)
    .limit(limit)
    .exec(function (err, states) {
      // var states=states.skip(skip);
      // Logger.info("states are",states);
          if(!err){
            domain.User.populate(states, {path: '_id.user' }, function(err, statesViews){
              if(!err){
                // Logger.info("the states are",statesViews);
                statesViews.forEach(function(user){
                  //Logger.info("the user is",user._id.user.location.state);
                  user._id = user._id.user.location.state;
                })
                domain.Ad_View_History.aggregate([{$match: {
                        ad_id : mongoose.Types.ObjectId(advert_id)
                    }
                }, {
                    $group: {
                        _id: {
                          city:"$userView._id",
                          latitude:"$userView.location.latitude",
                          longitude:"$userView.location.longitude"
                        },
                        totalusers: {
                            $sum: 1
                        }
                    }
                }])
                .skip(skip)
                .limit(limit)
                .exec(function (err, cities) {
                // Logger.info("the cities",err,cities);
                  domain.User.populate(cities, {path: '_id.city'}, function(err, populatedTransactions) {
                    // Logger.info("the response is",populatedTransactions);
                    // Your populated translactions are inside populatedTransactions
                    var city_geo = [];
                    var user = ' Views';
                    cities.forEach(function(place){
                      if(place.totalusers == 1){
                        user = " View";
                      }else {
                        user = " Views";
                      }
                      city_geo.push({
                        city:place._id.city.location.city,
                        lat:place._id.latitude,
                        long:place._id.longitude,
                        desc:place.totalusers + user
                      })
                    })

                    resData.states = statesViews;
                    resData.cities = city_geo;
                    //Logger.info("the resData",resData);
                    callback(err, SetResponse.setSuccess("total users", resData));
                  });
                });
              }else {
                callback(err, SetResponse.setSuccess("Some error has occurred !"));
              }
            })
          }else {
            callback(err, SetResponse.setSuccess("Some error has occurred !"));
          }
    });
}

AdminAdvertService.prototype.getUserTree = function(user, callback){

  domain.MLM.findOne({user_details:user}).populate('user_details').exec(function(err, res){
    if(!err && res){
      var parent_obj = {};
      parent_obj.name = res.user_details.name;
      parent_obj.id = res.node_id;
      parent_obj.parent = null;
      parent_obj.children = [];

      async.auto({
        recursive:function(next, results){
          return recursive_fn(parent_obj, next);
        }
      },
      function(err,result){
        //Logger.info("Sending the response");
        var resObject = [result.recursive];
        callback(err, SetResponse.setSuccess("The user tree is ", resObject));
      })

    }else {
      callback(err,SetResponse.setSuccess("Some error has occurred !"));
    }
  })

}

var recursive_fn = function(obj, super_next){
  //Logger.info("the obj is",obj);
  domain.MLM.findOne({node_id:obj.id}).populate('user_details').exec(function(err,res){
    if(!err){
      // Logger.info("The node is",res.node_id," ",res.child_node1," ",res.child_node2);
    //  obj.children = [];
    async.auto({
      recursion1:function(next,result){
        if(res){
          if(res.child_node1!=0){
            // Logger.info("Inside child node1 condn");
            domain.MLM.findOne({node_id:res.child_node1}).populate('user_details').exec(function(err,res1){
              if(!err && res1){
                var child1 = {};
                child1.name = res1.user_details.name;
                child1.parent = res.user_details.name;
                child1.id = res.child_node1;
                child1.children = [];
                obj.children.push(child1);
                return recursive_fn(child1, next);
              }else {
                next(null);
              }
            });
          }else {
            next(null);
          }
        }else {
          next(null);
        }
      },
      recursion2:function(next, result){
        if(res){
          if(res.child_node2!=0){
            domain.MLM.findOne({node_id:res.child_node2}).populate('user_details').exec(function(err,res2){
              if(!err && res2){
                var child2 = {};
                child2.name = res2.user_details.name;
                child2.parent = res.user_details.name;
                child2.id = res.child_node2;
                child2.children = [];
                obj.children.push(child2);
                return recursive_fn(child2, next);
              }else {
                next(null);
              }
            });
            // Logger.info("Inside child node2 condn");
            // var child2 = {};
            // child2.name = res.user_details.name;
            // child2.parent = res.node_id;
            // child2.id = res.child_node2;
            // child2.children = [];
            // obj.children.push(child2);
            // return recursive_fn(child2, next)
            // next(null)
          }else {
            next(null)
          }
        }else {
          next(null);
        }
      }
    },function(err, results){
      super_next(null,obj);
    })
    }

  })
}

AdminAdvertService.prototype.getLocationsAndStates = function (advert_id, callback) {
    //Logger.info("the advert is",advert_id);
    var resData = {};
    domain.Ad_View_History.aggregate([{$match: {
            ad_id : mongoose.Types.ObjectId(advert_id)
        }
    }, {
        $group: {
            _id: {
              user:"$userView._id",
              location:"$userView.location"
            },
            totalusers: {
                $sum: 1
            }
        }
    }])
    .exec(function (err, states) {
      // var states=states.skip(skip);
    //  Logger.info("states are",states);
          if(!err){
            domain.User.populate(states, {path: '_id.user' }, function(err, statesViews){
              if(!err){
                // Logger.info("the states are",statesViews);
                statesViews.forEach(function(user){
                  user.latitude=user._id.user.location.latitude;
                  user.longitude=user._id.user.location.longitude;
                  // Logger.info("the user is",user._id.user);
                  user._id = user._id.user.location.state;
                })
                // Logger.info("state views are ",statesViews);
                resData.states = statesViews;
          // var responseData=resData.states.skip(skip).limit(limit);
          // Logger.info("response datta is",responseData);
                callback(err, SetResponse.setSuccess("total users", resData));
}
else{
  callback(err, SetResponse.setSuccess("Some error has occurred !"));
}
})
}
else {
  callback(err, SetResponse.setSuccess("Some error has occurred !"));

}
})
}

AdminAdvertService.prototype.updateAdvertAanlytics =function(entryId,analytic_type,callback){
  // Logger.info("new value >",analytic_type.toLowerCase())
  var analyticType= analytic_type.toLowerCase();
  var analyticCall=false;
  var analyticVisit=false;
  if(analyticType != null  &&  analyticType !='undefined'){
  if(analyticType === "call"){
  domain.Advert.findOneAndUpdate(
    {"fileInformation.entry_id":entryId},
    {$inc:{'analytics.number_of_calls':1}},
    {new:true},function(err,updatedData){
      if(!err){
        // Logger.info("number calls value changed ",updatedData.analytics.number_of_calls);
        callback(err,SetResponse.setSuccess("Number of calls is updated"));
      }else{
        callback(err,SetResponse.setSuccess("Number of calls value is not updated"));
      }
    })
}else if(analyticType === "visit"){
  domain.Advert.findOneAndUpdate(
    {"fileInformation.entry_id":entryId},
    {$inc:{'analytics.number_of_visits':1}},
    {new:true},function(err,updatedData){
      if(!err){
        callback(err,SetResponse.setSuccess("Number of visits is updated"));
      }else{
        callback(err,SetResponse.setSuccess("Number of visits value is not updated"));
      }
    })
}else{
  callback(err,SetResponse.setSuccess("call or visit is not specified"));
}
}else{
  callback(SetResponse.setSuccess.SetResponse(" Analytic type is not defined "));
}
}
//## to get top 10 clients according to number of client charges
AdminAdvertService.prototype.getTopClients=function(callback){
  // Logger.info(" controle inside gettop clients");
  domain.User.aggregate([{
      $match: {
          role: 'ROLE_CLIENT',
          deleted: false
      }
              }, {
      $project: {
          name: 1,
          image_url: 1,
          "client_account.client_charges_available": 1

      }
              }, {
      $sort: {
          "client_account.client_charges_available": -1
      }
              }, {
      $limit: 10
              }], function (err, topClients) {
                var revenue_map = {};
                var cliend_ids = topClients.map(function(client){
                  revenue_map[client._id] = 0;
                  return client._id;
                });
                domain.Client_Charge_Per_Day.find({'client_details._id':{$in:cliend_ids}},{client_details:1,total_client_charge:1},function(error, revenues){
                  if(!err){
                  revenues.forEach(function(revenue){
                    revenue_map[revenue.client_details._id] = revenue_map[revenue.client_details._id] + revenue.total_client_charge;
                  })

                  topClients.forEach(function(client){
                    client.totalRevenue = revenue_map[client._id];
                  })

                callback(null,SetResponse.setSuccess('top 10 clients ', topClients));
              }else{
                callback(err,SetResponse.setSuccess(" No Such Client Exists !"));
              }
                })
  });
}
// ## to get top 10 advertisemnts according to total number of complete views
AdminAdvertService.prototype.getTopAdvertisements = function(callback){
  domain.Advert.aggregate([{
      $project: {
          name_of_advert: 1,
          number_of_times_complete_viewed: 1,
          thumbnail: 1,
          custom_thmbnail: 1,
          number_of_likes: 1,
          "fileInformation.entry_id": 1
      }
                  }, {
      $sort: {
          number_of_times_complete_viewed: -1,
          number_of_likes: -1
      }
                  }, {
      $limit: 10
                  }], function (err, topAdvertisement) {
      if(topAdvertisement.length){
        var newAdvertisements=createURL(topAdvertisement);
        // Logger.info("new advert ",newAdvertisements);
       callback(null,SetResponse.setSuccess('top 10 advertisements ', newAdvertisements));
     }else
          callback(null,{topAdvertisement:null});
  })
}
/*total sum client charges of advertisements*/
AdminAdvertService.prototype.getAdvertisementsCharges=function(callback){
  domain.User.aggregate([{
      $match: {
          role: 'ROLE_CLIENT',
          deleted: false
      }
              }, {
      $group: {
          _id: '$role',
          totalMoneyFlow: {
              $sum: '$client_account.client_charges_available'
          }
      }
              }], function (err, clientMoneyFlow) {
     if (clientMoneyFlow.length) {
          callback(null,SetResponse.setSuccess("Client Charges For Advertisements",clientMoneyFlow[0].totalMoneyFlow));
      }else
          callback(err,SetResponse.setSuccess("Info of Client charges for advertisement is not available !"));
  })
}

AdminAdvertService.prototype.getLocationBySearchState = function(advert_id,state,callback){
     var resData = {};
   domain.User.find({"location.state":state},function(err,users){
     var userIds=users.map(function(user){
       return user._id;
     })
     //  users.push(user._id);
    //  Logger.info("users are ",userIds);
     domain.Ad_View_History.aggregate([{$match: {
               ad_id : mongoose.Types.ObjectId(advert_id),
               "userView._id":{$in:userIds}
           }
       }, {
           $group: {
               _id: {
                 user:"$userView._id"
               },
               totalusers: {
                   $sum: 1
               }
           }
       }])
     .exec(function (err, userFromState) {
         // var states=states.skip(skip);
       //  Logger.info("states are",userFromState);
             if(!err){
               domain.User.populate(userFromState, {path: '_id.user' }, function(err, statesViews){
                 if(!err){
                   // Logger.info("the states are",statesViews);
                   statesViews.forEach(function(user){
                     user.latitude=user._id.user.location.latitude;
                     user.longitude=user._id.user.location.longitude;
                    //  Logger.info("the user is",user._id.user);
                     user._id = user._id.user.location.state;

                   })
                   // Logger.info("state views are ",statesViews);
                   resData.states = statesViews;
             // var responseData=resData.states.skip(skip).limit(limit);
             // Logger.info("response datta is",responseData);
                   callback(err, SetResponse.setSuccess("total users", resData));
   }
   else{
     callback(err, SetResponse.setSuccess("Some error has occurred !"));
   }
   })
 }
 else{
   callback(err, SetResponse.setSuccess("Some error has occurred !"));
 }
   })
 })
   }

AdminAdvertService.prototype.getAdvertisementDetails=function(advertid,callback){
  // Logger.info("new value >>",advert_id);
  var advertData={};
  domain.Advert.find({_id:advertid}).exec(function(err,userData){
    if(!err && userData){
  callback(err,SetResponse.setSuccess("Advetisement details ",userData));
    }else{
      callback(err,SetResponse.setSuccess("Advertisement information is not available"));
    }
  })

}

AdminAdvertService.prototype.updateAdvertAanlytics =function(entryId,analytic_type,callback){
  // Logger.info("new value >",analytic_type.toLowerCase())
  var analyticType= analytic_type.toLowerCase();
  var analyticCall=false;
  var analyticVisit=false;
  if(analyticType != null  &&  analyticType !='undefined'){
  if(analyticType === "call"){
  domain.Advert.findOneAndUpdate(
    {"fileInformation.entry_id":entryId},
    {$inc:{'analytics.number_of_calls':1}},
    {new:true},function(err,updatedData){
      if(!err){
        // Logger.info("number calls value changed ",updatedData.analytics.number_of_calls);
        callback(err,SetResponse.setSuccess("Number of calls is updated"));
      }else{
        callback(err,SetResponse.setSuccess("Number of calls value is not updated"));
      }
    })
}else if(analyticType === "visit"){
  domain.Advert.findOneAndUpdate(
    {"fileInformation.entry_id":entryId},
    {$inc:{'analytics.number_of_visits':1}},
    {new:true},function(err,updatedData){
      if(!err){
        callback(err,SetResponse.setSuccess("Number of visits is updated"));
      }else{
        callback(err,SetResponse.setSuccess("Number of visits value is not updated"));
      }
    })
}else{
  callback(err,SetResponse.setSuccess("call or visit is not specified"));
}
}else{
  callback(SetResponse.setSuccess.SetResponse(" Analytic type is not defined "));
}
}
//## to get top 10 clients according to number of client charges
AdminAdvertService.prototype.getTopClients=function(callback){
  // Logger.info(" controle inside gettop clients");
  domain.User.aggregate([{
      $match: {
          role: 'ROLE_CLIENT',
          deleted: false
      }
              }, {
      $project: {
          name: 1,
          image_url: 1,
          "client_account.client_charges_available": 1

      }
              }, {
      $sort: {
          "client_account.client_charges_available": -1
      }
              }, {
      $limit: 10
              }], function (err, topClients) {
                var revenue_map = {};
                var cliend_ids = topClients.map(function(client){
                  revenue_map[client._id] = 0;
                  return client._id;
                });
                domain.Client_Charge_Per_Day.find({'client_details._id':{$in:cliend_ids}},{client_details:1,total_client_charge:1},function(error, revenues){
                  if(!err){
                  revenues.forEach(function(revenue){
                    revenue_map[revenue.client_details._id] = revenue_map[revenue.client_details._id] + revenue.total_client_charge;
                  })

                  topClients.forEach(function(client){
                    client.totalRevenue = revenue_map[client._id];
                  })

                callback(null,SetResponse.setSuccess('top 10 clients ', topClients));
              }else{
                callback(err,SetResponse.setSuccess(" No Such Client Exists !"));
              }
                })
  });
}
// ## to get top 10 advertisemnts according to total number of complete views
AdminAdvertService.prototype.getTopAdvertisements = function(callback){
  domain.Advert.aggregate([{
      $project: {
          name_of_advert: 1,
          number_of_times_complete_viewed: 1,
          thumbnail: 1,
          custom_thmbnail: 1,
          number_of_likes: 1,
          "fileInformation.entry_id": 1
      }
                  }, {
      $sort: {
          number_of_times_complete_viewed: -1,
          number_of_likes: -1
      }
                  }, {
      $limit: 10
                  }], function (err, topAdvertisement) {
      if(topAdvertisement.length){
        var newAdvertisements=createURL(topAdvertisement);
        // Logger.info("new advert ",newAdvertisements);
       callback(null,SetResponse.setSuccess('top 10 advertisements ', newAdvertisements));
     }else
          callback(null,{topAdvertisement:null});
  })
}
/*total sum client charges of advertisements*/
AdminAdvertService.prototype.getAdvertisementsCharges=function(callback){
  domain.User.aggregate([{
      $match: {
          role: 'ROLE_CLIENT',
          deleted: false
      }
              }, {
      $group: {
          _id: '$role',
          totalMoneyFlow: {
              $sum: '$client_account.client_charges_available'
          }
      }
              }], function (err, clientMoneyFlow) {
     if (clientMoneyFlow.length) {
          callback(null,SetResponse.setSuccess("Client Charges For Advertisements",clientMoneyFlow[0].totalMoneyFlow));
      }else
          callback(err,SetResponse.setSuccess("Info of Client charges for advertisement is not available !"));
  })
}

AdminAdvertService.prototype.getIncomeByDate = function (date,callback) {
  if(parseInt(date)!=0){
    date = new Date(date);

    var oneDayPrevious = new Date(date.setDate(date.getDate() - 1));
    date.setHours(18, 0, 0, 0);
    oneDayPrevious.setHours(18,0,0,0);

    // console.log("the dates are",date,oneDayPrevious);

    domain.Admin_Earning_Bucket.find(
      {date_of_earning:{$gte:oneDayPrevious,$lte:date}},
      {date_of_earning:1,total_amount:1},
      function(err,res){
        // console.log("the res is",err,res);
        callback(err,res);
    })
  }else {
    console.log("Inside the else");
    domain.Admin_Earning_Bucket.find(
      {},{date_of_earning:1,total_amount:1},
      function(err,res){
        // console.log("the res is",err,res);
        callback(err,SetResponse.setSuccess("Details are as follows !",res));
    })
  }

}

AdminAdvertService.prototype.updateIncome = function (id, amount, callback) {
  domain.Admin_Earning_Bucket.findOne({_id:id},{total_amount:1},function(err,res){
    // console.log("the res is",res);
    var old_amount = parseFloat(res.total_amount);
    var new_amount = parseFloat(amount);
    var diff = old_amount - new_amount;
    // console.log("the diff is 1",old_amount,new_amount);
    domain.Admin_Earning_Bucket.update({_id:id},{$set:{total_amount:new_amount}},function(err,resObj){
      // console.log("first",err,resObj);
      diff = -1 * diff;
      // console.log("the diff is",old_amount,new_amount,diff);
      domain.Admin_Earning_Details.update(
        {deleted:false},
        {$inc:{total_amount:diff}},function(err,updateObj){
          domain.Admin_Earning_Details.findOne(
            {deleted:false},
            {total_amount:1},function(err,updateObj){
              // console.log("sec",err,updateObj);
              callback(err,SetResponse.setSuccess("Updated !",updateObj.total_amount));
            })
        })
    })

  })
}
module.exports = function (app) {
    return new AdminAdvertService(app);
};
