
var getDbConnection = function(){
  global.weone_advertiser = mongoose.createConnection('mongodb://admin:admin@localhost:27017/weone_advertiser');
  if(weone_advertiser){
    console.log(" connnected to weone advertiser database");
  }else {
    console.log(" connection error in weone advertiser database");
  }
}
module.exports.getDbConnection = getDbConnection;
