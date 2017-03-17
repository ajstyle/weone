var encrypt = require('../../../application-utilities/EncryptionUtility');
var AuthenticationService = require("../services/common/AuthenticationService").AuthenticationService;
var SetResponse = require('../services/SetResponseService');
module.exports = function () {

  var getUserContactsList = function (req, res, callback) {
      //Logger.info("control in the getUserContactsList in UserController");
      var contactList = req.body.phonebook_details;
      this.services.chatService.getUserContactsList(contactList,req.loggedInUser, callback)
  }

  var createChatChannel = function(req, res, callback){
    this.services.chatService.createChatChannel(req.loggedInUser,req.body.friend_id, callback)
  }

  var default_fn = function(req, res, callback){
    // this.services.cacheManagingService.updateMongoCollectionCache('users');
    CacheManagingService.prototype.updateMongoCollectionCache('adverts');
    callback(null, SetResponse.setSuccess("HELLO"));//
  }

  var getInviteList = function(req, res, callback){
    var timestamp = req.params.timestamp;
    this.services.chatService.getInviteList(req.loggedInUser, timestamp, callback)
  }

  var updateContacts = function(req, res, callback){
    var data = req.body.phonebook;
    this.services.chatService.updateContacts(req.loggedInUser, data, callback)
  }

return {
  getUserContactsList:getUserContactsList,
  createChatChannel:createChatChannel,
  default_fn:default_fn,
  getInviteList:getInviteList,
  updateContacts:updateContacts
}
};
