/*
 * @author Abhimanyu
 * This module is for the authorization process . Called as middleware function to decide whether user have enough authority to access the
 *
 */
var async = require('async')
var SetResponse = require('../application/controller-service-layer/services/SetResponseService');
module.exports.AuthorizationMiddleware = (function () {

   /*
    *  Verify user is authorized to access the functionality or not
    */
    var verifyIsRoleInAccessLevel = function (next, results, res, req, accessLevel) {
        var roleInAccessLevel = configurationHolder.config.accessLevels[accessLevel]
        var authorized = false
        domain.User.findOne({
            _id: results.authorizationTokenObject.user
        }).exec(function (err, userObject) {
            if (roleInAccessLevel.indexOf(userObject.role) > -1) {
                authorized = true
                req.loggedInUser = userObject
                next(results, authorized)
            } else {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.Message.Error.failedAuthorization, true, 401)
            }
        })
    }

    /*
     * find User and its role using authenticationToken.
     */
    var findRoleByAuthToken = function (next, results, req, res, authToken) {
        Logger.info(authToken)
        domain.Authentication_Token.findOne({
            authToken: authToken
        }).exec(function (err, authObj) {
            if (err || authObj == null) {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.Message.Error.failedAuthorization, true, 401)
            } else {
                next(null, authObj)
            }
        })
    }

    /*
     *  call as middleware to decide the accessiblity of the function for the loggedIn user
     *  find user by AuthenticationToken
     *  Decide based on the role of user and accesslevel whether user is authorized or not
     */
    var authority = function (accessLevel) {
        return function (req, res, next) {
            var authToken = req.get("X-Auth-Token");
            Logger.info(accessLevel,"token",authToken)
            if (authToken == null && accessLevel == "user") {
                Logger.info("executed in accesslevel ")
                req.loggedInUser = null
                next()
            } else {
                async.auto({
                    authorizationTokenObject: function (next, results) {
                        return findRoleByAuthToken(next, results, req, res, authToken)
                    },
                    isRoleInAccessLevel: ['authorizationTokenObject', function (next, results) {
                        verifyIsRoleInAccessLevel(next, results, res, req, accessLevel)
                                         }]
                }, function (err, results) {
                    if (results.isRoleInAccessLevel == true) {
                        next()
                    } else {
                      configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.Message.Error.failedAuthorization, true, 401)
                    }
                })
            }
        }
    }

    var serverStatus = function(){
      return function(req, res){
        if(configurationHolder.config.serverStatus){
          res.send("Ok")
        }else {
          res.status(404)        // HTTP status 404: NotFound
            .send('404 - Page Not Found');
        }
      }
    }

    //public methods are  return
    return {
        authority: authority,
	serverStatus:serverStatus
    };
})();
