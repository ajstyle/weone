var BaseService = require('./BaseService');
CacheManagingService = function (app) {
    this.app = app;
};
var _ = require('lodash');
CacheManagingService.prototype = new BaseService();
// var cache_prefix = configurationHolder.config.cacheOptions.prefix;

CacheManagingService.prototype.updateMongoCollectionCache = function(collection_name){
  // Logger.info("Clearing the ",collection_name," cache");
  var key = cache_prefix+":"+collection_name+"*";
  for(var i=0;i<4;i++){
    redis_client[i].keys(key, function(err, rows) {
      if(rows.length>0){
        // Logger.info("aaa",i);
        redis_client[i].del.apply(redis_client[i] , rows)
      }
    });
  }
}

CacheManagingService.prototype.resetCache = function(){
  // Logger.info("flushing the data");
  for(var i=0;i<4;i++){
    redis_client[i].flushdb(function(err, rows) {

    });
  }
}

CacheManagingService.prototype.updateLikes = function(entryId, number_of_likes){
  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }

  var query = domain.Advert.find({
      advert_status: 'ready',
      deleted: false,
      "schedule.end_date": {
        $gte:todaydate
      },
      "schedule.start_date": {
        $lte:todaydate
      }
  },{comment_bucket_ids:0,current_like_bucket:0}).skip(0).limit(0).populate("client_details._id", "logo_image_url client_org_name phonenumber").sort({
      "schedule.start_date": -1
  });

  redis_client.get(getCacheKeyByQuery(query), function(err, rows) {

    rows = JSON.parse(rows);

    async.forEach(rows,function(advert, callback){
      if(advert.fileInformation.entry_id == entryId){
        // Logger.info("updating cache");
        advert.number_of_likes = number_of_likes
        callback();
      }else {
        callback();
      }
    },function(err){
      redis_client.set(getCacheKeyByQuery(query), JSON.stringify(rows), function(err, rows) {
        if(!err){
          // Logger.info("Advert Updated in Cache")
        }else {
          // Logger.info("Some Error in Updating the Advert in Cache")
        }
      });
    })


  });

}

CacheManagingService.prototype.updateComments = function(entryId, number_of_comments){
  var todaydate = new Date();
  if(todaydate>new Date().setHours(18,30,0,0)){
    todaydate = new Date(todaydate.getTime() + 1*24*60*60000);
    todaydate = todaydate.setHours(18,30,0,0);
  }else {
    todaydate = new Date().setHours(18,30,0,0)
  }

  var query = domain.Advert.find({
      advert_status: 'ready',
      deleted: false,
      "schedule.end_date": {
        $gte:todaydate
      },
      "schedule.start_date": {
        $lte:todaydate
      }
  },{comment_bucket_ids:0,current_like_bucket:0}).skip(0).limit(0).populate("client_details._id", "logo_image_url client_org_name phonenumber").sort({
      "schedule.start_date": -1
  });

  redis_client.get(getCacheKeyByQuery(query), function(err, rows) {

    rows = JSON.parse(rows);

    async.forEach(rows,function(advert, callback){
      if(advert.fileInformation.entry_id == entryId){
        // Logger.info("updating cache");
        advert.number_of_comments = number_of_comments
        callback();
      }else {
        callback();
      }
    },function(err){
      redis_client.set(getCacheKeyByQuery(query), JSON.stringify(rows), function(err, rows) {
        if(!err){
          // Logger.info("Advert Updated in Cache")
        }else {
          // Logger.info("Some Error in Updating the Advert in Cache")
        }
      });
    })


  });

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


module.exports = function (app) {
    return new CacheManagingService(app);
};
