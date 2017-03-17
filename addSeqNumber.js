global.configurationHolder = require('./configurations/DependencyInclude.js')
global.networkjobApp = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
var MongoClient = require('mongodb').MongoClient;
var sync = require('synchronize')
var CronJob = require('cron').CronJob;
var options = {server: {socketOptions: {connectTimeoutMS: 600000,keepAlive:300000}},replSet: {},mongos: {},auto_reconnect: true,poolSize: 500};
MongoClient.connect("mongodb://admin:admin@localhost:27017/Weone",options, function(err, db) {  //FOR STAGING and LOCAL
// MongoClient.connect("mongodb://admin:admin@10.10.50.130:27017/Weone",options, function(err, db) { //FOR PRODUCTION SERVER

var initialize=function(){
  console.log("process initialized.................")
  var skip=0;
  var limit=1000;
  var seqnumber=1;
      domain.User.count({
          deleted: false,
          role: 'ROLE_USER'
      }, function (err, userCount) {
           console.log("total number of users >>>",userCount);
          SeqNumUpdation(skip,limit,seqnumber,userCount);
      });
  //SeqNumUpdation(skip,limit,seqnumber);
}
var SeqNumUpdation=function(skip,limit,seqnumber,userCount){
   console.log(" skip and limit ,seq,users",skip, " ",limit," ",seqnumber," ",userCount);
  var counter=0;
  domain.User.find({role:"ROLE_USER" , deleted:false}).skip(skip).limit(limit).exec(function(err,userObj){
    if(!err){
      updateSeqNum(userObj,counter,skip,limit,seqnumber,userCount);
    }
  })
}
var updateSeqNum=function(userObj,counter,skip,limit,seqnumber,userCount){
  console.log("limit counter skip",limit, " ",counter," ",skip);
  var seqnumber=parseInt(seqnumber);
  async.forEach(userObj, function(data,callback){
    domain.User.update(
      {_id:data._id},
      {$set:{'sequenceId':seqnumber}},
      { upsert: true },function(err,users){
        if(!err){
          // console.log(" user value ",users);
          callback(new Error(err));
        }else{
          // console.log(" >>>>>>>>>",err);
          callback(new Error(err));
        }
      }
    );
counter=counter+1;
seqnumber=seqnumber+1;
},function(err){
     skip=skip + limit;
     console.log("Next SequenceId is  ",seqnumber);
     //use seqnumber 1 more than total users.....in if() condition

     domain.User.count({
          deleted: false,
          role: 'ROLE_USER'
      }, function (err, userCount) {
          console.log("total number of users >>>",userCount);
          var limitCount = parseInt(userCount) +1;
          if(seqnumber!=limitCount){
            SeqNumUpdation(skip,limit,seqnumber);
          }else{
            console.log("SequenceId generation process is completed..............");
            newSeqDoc(seqnumber-1);
          }
          // SeqNumUpdation(skip,limit,seqnumber,userCount);
      });
})
}


var newSeqDoc =function(seqnumber){
  var seq={};
  seq.sequenceId = seqnumber;
  var saveSeq=new domain.Sequence(seq);
  saveSeq.save(function(err,object){
    if(object){
      console.log("user object is ",object , ">>> ",object.sequenceId);
    }else{
      conole.log("error occured ",err);
    }
  })
}

<<<<<<< HEAD
 initialize();
=======
initialize();
>>>>>>> 802de293fac27a7cb4943654e4745bfc90ef9153
});
