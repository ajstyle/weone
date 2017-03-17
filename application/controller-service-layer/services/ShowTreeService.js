var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
ShowTreeService = function (app) {
    this.app = app;
};
ShowTreeService.prototype = new BaseService();

/*
It will provide the network status of MLM upto 10 levels.It will information of bottom of tree user ie name of user,balance in his
account. and This information commes from jobs and store history in document(User_Network_details)
*/
ShowTreeService.prototype.networkStatusService = function (user, callback) {

    domain.User_Network_Detailsv2.findOne({user_id:user._id},{number_of_levels:1,levels:1,user_id:1,node_id:1}).lean().exec(function(err,result){
      if(!err){
        result = JSON.parse(JSON.stringify(result));
        async.forEach(result.levels, function(level, pass1){
          var totalbalance = 0;
          async.forEach(level.persons, function(person, pass2){
            totalbalance = totalbalance + person.total_balance;
            person.total_balance = (Math.round(person.total_balance * 100) / 100);
            pass2();
          },function(err1){
            if(level.level_name=='Level 0'){
              level.totalbalance = 'Rs. '+ (Math.round(user.user_account.wallet.wallet_amount_available * 100) / 100);
            }else {
              level.totalbalance = 'Rs. '+ (Math.round(totalbalance * 100) / 100);
            }

            // delete level['persons'];
            pass1();
          })
        },function(err2){
          // Logger.info("Sending the Response");
          if(result.number_of_levels>1){
            return callback(null, SetResponse.setSuccess("Your Tree is",result));
          }else {
            return callback(null, SetResponse.setSuccess(configurationHolder.Message.Success.minInvite,result));
          }
        })
      }else {
        callback(null, SetResponse.setSuccess("Some Error",{}));
      }
    })
}

var levelSorting = function(levels){
  for(var i=0;i<levels.length;i++){
    for(var j=i+1;j<levels.length;j++){
      if(levels[i]>levels[j]){
        var temp = levels[i];
        levels[i] = levels[j];
        levels[j] = temp;
      }
    }
    levels[i] = "Level "+levels[i];
  }
  return levels;
}

var changeTheNameOfLevel = function (level_name, levelobj) {
    switch (level_name) {
    case "Level1":
        levelobj.level_name = "Level 1"
        break;
    case "Level2":
        levelobj.level_name = "Level 2"
        break;
    case "Level3":
        levelobj.level_name = "Level 3"
        break;
    case "Level4":
        levelobj.level_name = "Level 4"
        break;
    case "Level5":
        levelobj.level_name = "Level 5"
        break;
    case "Level6":
        levelobj.level_name = "Level 6"
        break;
    case "Level7":
        levelobj.level_name = "Level 7"
        break;
    case "Level8":
        levelobj.level_name = "Level 8"
        break;
    case "Level9":
        levelobj.level_name = "Level 9"
        break;
    case "Level10":
        levelobj.level_name = "Level 10"
        break;
    case "Level0":
        levelobj.level_name = "Level 0"
        break;
    }
    return levelobj;
}

ShowTreeService.prototype.showTreeOnAdmin = function (userId, callback) {
    //Logger.info("control in the show tree on admin panel");
    domain.User_Network_details.findOne({
        user_id: userId,
        deleted: false,
    }).sort({
        created: -1
    }).exec(function (err, networkObj) {
        if (networkObj) {
            networkObj.levels.sort(function (a, b) {
              if (parseInt(a.level_name.substr(6,a.level_name.length)) > parseInt(b.level_name.substr(6,b.level_name.length)))
                  return 1
              else if (parseInt(a.level_name.substr(6,a.level_name.length)) < parseInt(b.level_name.substr(6,b.level_name.length)))
                  return -1
              else
                  0

                // if (a.level_name > b.level_name)
                //     return 1
                // else if (a.level_name < b.level_name)
                //     return -1
                // else
                //     0
            });
            //Logger.info("object after sort", networkObj)
            createTreeObjectForAdmin(networkObj);
        } else {
            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.NoNetworkTree, null));
        }
    });
}

var createTreeObjectForAdmin = function (networkObj) {
    var adminTreeObject = {};
    var totalNumberOfLevels = networkObj.number_of_levels;


  /*  for (var i = 0; i < totalNumberOfLevels; i++) {
        var totalPersonInLevel = networkObj.levels[i].person_count;
        var level_name=networkObj.levels[i].level_name;



        switch (level_name) {
        case "Level1":

            break;
        case "Level2":
            break;
        case "Level3":
            break;
        case "Level4":
            break;
        case "Level5":
            break;
        case "Level6":
            break;
        case "Level7":
            break;
        case "Level8":
            break;
        case "Level9":
            break;
        case "Level10":
            break;
        case "Level0":
            adminTreeObject.name=networkObj.levels[i].person_object_id[0].name;
            adminTreeObject.children=[];
            break;
        }
    }*/
}



module.exports = function (app) {
    return new ShowTreeService(app);
};
