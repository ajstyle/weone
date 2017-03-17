var encrypt = require('../../../application-utilities/EncryptionUtility');
var AuthenticationService = require("../services/common/AuthenticationService").AuthenticationService;
var SetResponse = require('../services/SetResponseService');
module.exports = function () {

   var generate_user_parent_tree = function(req, res, callback){
     this.services.scriptService.generate_user_parent_tree(req.params, callback);
   }

   var generateMLM = function(req,res,callback){
    //  Logger.info("controller");
     this.services.scriptService.generateMLM(req.params, callback)
   }

   var generateTree = function(req,res,callback){
     this.services.scriptService.generateTree(req.params, callback)
   }

  return {
    generate_user_parent_tree:generate_user_parent_tree,
    generateMLM:generateMLM,
    generateTree:generateTree
  }
};
