var SetResponse = require('../services/SetResponseService');
module.exports = function () {
    /*
            {advert:{name_of_advert:'',age_group:{min_age:'',max_age:''},gender:'',availablity_locality:{latitude:'',longitude:'',radius:''},schedule:{start_date:'',end_date:''},advert_type:'',client_details:{name:''}}}
               //    advert.thumbnail = fileInformation.entry_id + '_thumbnail.' + fileInformation.extensions_name;
   /* gm(serverPath).quality(0).write(path + '/' + advert.thumbnail, function (err) {
                                     if (err)
                                         ////Logger.info('error in thumbnail for image', err);
                                     self.services.advertService.uploadVideoService(advert, ad_id, callback);
                                 });*/

    var createAdvertisment = function (req, res, callback) {
        //Logger.info("control in the create advertisment");
        //var advert = JSON.parse(req.body.advert);
        var advert = req.body.advert;
        this.services.adminAdvertService.saveAdvertisement(advert, callback);
    }

    var removeVideoToken = function (token) {
        domain.Video_Upload_Token.remove({
            authToken: token,
            deleted: false
        }, function (err, obj) {
            //Logger.info("token remove successfully");
        });
    }

    var videoUpload = function (req, res, callback) {
        //Logger.info("control in video upload controller");
        var self = this;
        domain.Video_Upload_Token.findOne({
            authToken: req.body.token,
            deleted: false,
        }, function (err, object) {
            if (object && ((new Date() - new Date(object.created)) < 3600000)) {
                removeVideoToken(req.body.token);
                var ad_id = object.advert_id;
                var advert = {};
                advert.advert_flavor_available = [];
                advert.advert_status = "transcoding";
                advert.advert_type = object.advert_type;
                var files = req.files.file;
                var fileInformation = {};
                fileInformation.entry_id = new Date().getTime() + Math.floor(Math.random() * 10000);
                var nameSplitArray = files.name.split('.')
                fileInformation.extensions_name = nameSplitArray[nameSplitArray.length - 1];
                fileInformation.fileName = fileInformation.entry_id + '_source.' + fileInformation.extensions_name;
                fileInformation.file_size = files.size;
                var path = configurationHolder.config.advertisementPath + fileInformation.entry_id;
                advert.fileInformation = fileInformation;
                var serverPath = path + '/' + fileInformation.fileName;
                try {
                    file.mkdirSync(path);
                    file.chmod(path, 0777)
                    //Logger.info('folder created sucessfully');
                } catch (e) {
                  // Logger.info("the error is",e);
                    //Logger.info("error in creating folder");
                }
               self.services.adminAdvertService.uploadVideoService(path,files.path,serverPath,advert,fileInformation,ad_id,callback);
            } else {
                //Logger.info("video token is expired");
                callback(SetResponse.setError(configurationHolder.Message.Error.invalidvideoToken, 401), null);
            }
        })
    }
    var generateVideotoken = function (req, res, callback) {
        //Logger.info("control in the generate video token controller");
        var obj = req.body.videoToken;
        obj.authToken = uuid.v1();
        var videoToken = new domain.Video_Upload_Token(obj);
        videoToken.save(function (err, obj) {
            callback(err, SetResponse.setSuccess("token generated", obj));
        });
    }
    var getAllAdvertisement = function (req, res, callback) {
        //Logger.info("control in the get all advertsiement for admin");
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        this.services.adminAdvertService.getAllAdvertisement(limit, skip, callback);
    }

    var editAdvertisement = function (req, res, callback) {
        //Logger.info("control in the editAdvertisement for admin");
        var advertobject = req.body.advert;
        var advertid = req.params.advertid;
        this.services.adminAdvertService.editAdvertisement(advertobject, advertid, callback);
    }
    var deleteAdvertisement = function (req, res, callback) {
        //Logger.info("control in the deleteAdvertisement");
        var advertid = req.params.advertid;
        this.services.adminAdvertService.deleteAdvertisement(advertid, callback);
    }

    var getUserAdvertisement = function (req, res, callback) {
       // //Logger.info("control in the getUserAdvertisement with following token..", req.get("X-Auth-Token"));
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        this.services.advertService.getUserAdvertisement(limit, skip, req.loggedInUser, callback);

    }
    var searchUserAdvertisement = function (req, res, callback) {
        //Logger.info("control in the search advertisement ");
        var name = req.params.name;
        var limit = parseInt(req.params.limit);
        var skip = parseInt(req.params.skip);
        this.services.adminAdvertService.searchAdvertisement(name, limit, skip, callback);
    }
    var advertisementComment = function (req, res, callback) {
        //Logger.info("control in the advertisement comment ");
        var object = {};
        object.entryid = req.body.entryid;
        object.comment = req.body.comment;
        object._id = req.loggedInUser._id;
        if(object.comment.length>160){
             return res.status(200).send({
             error:true,
             message: 'Maximum comment length can not exceed 160 charachters'
          });
        }else {
          this.services.advertService.commentOnAdvertisement(object, callback);

        }
        // this.services.advertService.commentOnAdvertisement(object, callback);
    }
    var likeUnlike = function (req, res, callback) {
        //Logger.info("control in the advertisment like and dislike");
        var object = {};
        object.entryid = req.body.entryid;
        object._id = req.loggedInUser._id;
        this.services.advertService.likeUnlikeServcie(object, callback);
    }
    var getComment = function (req, res, callback) {
        //Logger.info("control in the get comment ", req.params.entryid);
        this.services.advertService.getCommentService(req.loggedInUser._id, req.params.entryid, callback);
    }
    var clickOnCount = function (req, res, callback) {
        //Logger.info("control in the click on count");
        var object = {};
        object.user = {};
        object.entryid = req.body.entryid;
        object.user._id = req.loggedInUser._id;
        object.user.age = req.loggedInUser.age;
        object.user.gender = req.loggedInUser.gender;
        object.user.location = req.body.location;
        this.services.advertService.clickOnCountService(object, callback);
    }
    var viewOnAdvert = function (req, res, callback) {
        //Logger.info("control in the view on advertisment controller");
        var object = {};
        object.user = {};
        object.entryid = req.body.entryid;
        object.user._id = req.loggedInUser._id;
        object.user.age = req.loggedInUser.age;
        object.user.gender = req.loggedInUser.gender;
        object.user.location = req.body.location;
        this.services.advertService.adViewService(object, callback);
    }
    var completeViewOnAdvert = function (req, res, callback) {
        //Logger.info("control in the complete view on advertisment controller");
        var object = {};
        object.entryid = req.body.entryid;
        object._id = req.loggedInUser._id;
        this.services.advertService.completeViewService(object, callback);
    }
    var networkStatus = function (req, res, callback) {
        //Logger.info("control in the network status");
        this.services.showTreeService.networkStatusService(req.loggedInUser, callback);
    }

    var dashBoardData = function (req, res, callback) {
        //Logger.info("control in the dashBoard data ");
        this.services.adminAdvertService.getDashboardData(callback);
    }
    var getLocations = function (req, res, callback) {
        //Logger.info("control in the get locations");
        this.services.adminAdvertService.getUserLocations(callback);
    }
    var getNewVideo = function (req, res, callback) {
        //Logger.info("control in getNewVideo count", req.loggedInUser._id);
        this.services.advertService.getNewVideoCount(req.loggedInUser, callback);
    }
    var show_all_comments = function (req, res, callback) {
      // Logger.info("Inside the controller",req.params);
        this.services.advertService.show_all_comments(req.params, callback);
    }
    var getLocationsAndCities = function (req, res, callback) {
        //Logger.info("control in the get locations");
        // Logger.info("the params are",req.params.advertisement_id);
        var skip=parseInt(req.params.skip);
        var limit=parseInt(req.params.limit);
        Logger.info("skip and limit is",skip,limit);
        this.services.adminAdvertService.getLocationsAndCities(req.params.advertisement_id,skip,limit, callback);
    }
    var getUserTree = function (req, res, callback) {
        // Logger.info("the params are",req.params);
        this.services.adminAdvertService.getUserTree(req.params.user_id, callback);
    }
    var addComment = function (req, res, callback){
      var object = {};
      object.entryid = req.body.entryid;
      object.comment = req.body.comment;
      object._id = req.loggedInUser._id;
      if(object.comment.length>160){
           return res.status(200).send({
           error:true,
           message: 'Maximum comment length can not exceed 160 charachters'
        });
      }else {
        this.services.advertService.addComment(req.loggedInUser, object, callback);
      }

    }
    var getLocationsAndStates = function (req, res, callback) {
        //Logger.info("control in the get locations");
        // Logger.info("the params are",req.params.advertisement_id);
        // var skip=parseInt(req.params.skip);
        // var limit=parseInt(req.params.limit);
        // Logger.info("skip and limit is",skip,limit);
        this.services.adminAdvertService.getLocationsAndStates(req.params.advertisement_id, callback);
    }
    var getLocationBySearchState = function (req, res, callback) {
      Logger.info("hello in controller of search by state");
        this.services.adminAdvertService.getLocationBySearchState(req.params.advertisement_id,req.params.state, callback);
    }
    var getAdvertisementDetails = function(req,res,callback){
      this.services.adminAdvertService.getAdvertisementDetails(req.params.advertid,callback)
    }
    var updateAdvertAanlytics = function(req,res,callback){
      this.services.adminAdvertService.updateAdvertAanlytics(req.params.advertid,req.params.analytic_type,callback)
    }
    var getTopClients = function(req,res,callback){
      this.services.adminAdvertService.getTopClients(callback);
    }
    var getTopAdvertisements = function(req,res,callback){
      this.services.adminAdvertService.getTopAdvertisements(callback);
    }
    var getAdvertisementsCharges = function(req,res,callback){
      this.services.adminAdvertService.getAdvertisementsCharges(callback);
    }

    var getIncomeByDate = function(req,res,callback){
      var date = req.params.date;
      this.services.adminAdvertService.getIncomeByDate(date,callback);
    }

    var updateIncome = function(req,res,callback){
      var id = req.params.id;
      var amount = req.params.amount;
      this.services.adminAdvertService.updateIncome(id, amount, callback);
    }


    return {
        createAdvertisment: createAdvertisment,
        getAllAdvertisement: getAllAdvertisement,
        editAdvertisement: editAdvertisement,
        deleteAdvertisement: deleteAdvertisement,
        getUserAdvertisement: getUserAdvertisement,
        searchUserAdvertisement: searchUserAdvertisement,
        advertisementComment: advertisementComment,
        likeUnlike: likeUnlike,
        videoUpload: videoUpload,
        generateVideotoken: generateVideotoken,
        getComment: getComment,
        clickOnCount: clickOnCount,
        viewOnAdvert: viewOnAdvert,
        completeViewOnAdvert: completeViewOnAdvert,
        networkStatus: networkStatus,
        dashBoardData: dashBoardData,
        getLocations: getLocations,
        getNewVideo: getNewVideo,
        show_all_comments:show_all_comments,
        getLocationsAndCities:getLocationsAndCities,
        getUserTree:getUserTree,
        addComment:addComment,
        getLocationsAndStates:getLocationsAndStates,
        getLocationBySearchState:getLocationBySearchState,
        getAdvertisementDetails:getAdvertisementDetails,
        updateAdvertAanlytics:updateAdvertAanlytics,
        getTopClients:getTopClients,
        getTopAdvertisements:getTopAdvertisements,
        getAdvertisementsCharges:getAdvertisementsCharges,
        getIncomeByDate:getIncomeByDate,
        updateIncome:updateIncome
    }
}
