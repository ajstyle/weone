var encrypt = require('../../../application-utilities/EncryptionUtility');
module.exports = (function () {

    var DELEGATEDADMIN_ALLOWED_ROLES = ["ROLE_USER", "ROLE_CLIENT"]
    var ADMIN_ALLOWED_ROLES = ["ROLE_USER", "ROLE_CLIENT", "ROLE_DELEGATED_ADMIN", "ROLE_ADMIN"]
    var USER_ALLOWED_ROLES = ["ROLE_USER"]
    var CLIENT_ALLOWED_ROLES = ["ROLE_CLIENT"]

    /*
     * This function validate whether conditions meet before a user creation or not
     * Condition like only superadmin can create User with Role Admin
     * SuperAdmin can update user details and user himself
     */

    var authorizeUserRegistrationRequest = function (loggedInUser, role, res, callback) {
        //       var userRole = "ROLE_USER"
        if (loggedInUser) {
            userRole = loggedInUser.role
        }
        //Logger.info("user role is  = " + userRole + "   loggedinuser" + loggedInUser)
        switch (userRole) {
        case "ROLE_CLIENT":
            return checkAuthorizationForCreatingUserWithRole(CLIENT_ALLOWED_ROLES, role, res, callback)
            break;
        case "ROLE_ADMIN":
            return checkAuthorizationForCreatingUserWithRole(ADMIN_ALLOWED_ROLES, role, res, callback)
            break;
        case "ROLE_USER":
            return checkAuthorizationForCreatingUserWithRole(USER_ALLOWED_ROLES, role, res, callback)
            break;
        case "ROLE_DELEGATED_ADMIN":
            return checkAuthorizationForCreatingUserWithRole(DELEGATEDADMIN_ALLOWED_ROLES, role, res, callback)
            break;
        default:
            if (role == "ROLE_USER") {
                return true
            } else {
                /*        configurationHolder.ResponseUtil.responseHandler(res,null,"Unauthorized User",true,401)
                    }*/
            }
            callback(this.services.setResponseService.SetResponse.setError(configurationHolder.Message.Error.unauthorize, 401), null)
            break;
        }
    }



    var checkAuthorizationForCreatingUserWithRole = function (allowed_roles, role, res, callback) {
        //Logger.info(allowed_roles)
        //Logger.info("role == " + role);
        if (allowed_roles.indexOf(role) == -1) {
            //   configurationHolder.ResponseUtil.responseHandler(res,null,"Unauthorized User",true,401)
            callback(this.services.setResponseService.SetResponse.setError(configurationHolder.Message.Error.unauthorize, 401), null)
        }
        return true
    }


    var validatePassword = function (salt, password, password2, res, callback) {
        if (password == password2) {
            var encryptedPassword = crypto.createHmac('sha1', salt).update(password).digest('hex')
            return encryptedPassword
        } else {
            // configurationHolder.ResponseUtil.responseHandler(res,null,"password does't match",true,403);
            callback(this.services.setResponseService.SetResponse.setError(configurationHolder.Message.Error.unauthorize, 401))
        }
    }

    /*
     Function is used for create AppUsers while taking details in body and call the registration service .
    */
    var createAppUser = function (req, res, callback) {
        Logger.info("create user running..",req.body);
        var userObject = req.body.user
        var role = req.body.user.role
        // Logger.info("role is..", role);
        if (!role || role == undefined) {
            Logger.info("role is not there");
            role = "ROLE_USER"
            userObject.role = role;
        }
        userObject.salt = uuid.v1();
        if(req.body.user.phonenumber != null){
          domain.User.findOne({
            phonenumber: parseInt(req.body.user.phonenumber)
        }, function (err, obj) {
          // Logger.info("user email >>>>");
           Logger.info("user email >>>>",obj.email);
          if(!err && obj){
            if(!obj.email){
              RegistrationService.prototype.appUserRegistration(userObject, callback);
              // this.services.registrationService.appUserRegistartion(userObject, callback);
            }else{
              callback(err,SetResponse.setSuccess("User already registered.Please login again.",{isUserAlreadyRegistered:true,alreadyEmailExist:false}));
            }
          }else{
            callback(err,SetResponse.setSuccess("Invalid phonenumber !"));
          }
        })
      }

    }


    /*
     Function is used for create AdminUsers while taking details in body and call the registration service .
    */

    var createAdminUser = function (req, res, callback) {
        //Logger.info("control in the create admin user");
        var salt = uuid.v1();
        var user = new domain.User(req.body.user);
        user.salt = salt;
        user.password = encrypt(salt, user.password);
        this.services.registrationService.adminUserRegistartion(user, callback);
    }

    /*
    Function is used for sending sms to the user with OTP.
*/
    var sendOTPSMS = function (req, res, callback) {
        //Logger.info("control in the sendOTPSMS");
        var mobileNumber = req.params.mobileNumber;
       // var xauthtoken = req.get('X-Auth-Token');
        this.services.registrationService.saveSendOtp(mobileNumber, req.loggedInUser, callback);
    }

    var contact_us = function(req, res, callback){
      var data = req.body;
      var user = req.loggedInUser._id;
      this.services.registrationService.contact_us(data, user, callback);

    }


    //public methods are  return
    return {
        createAppUser: createAppUser,
        createAdminUser: createAdminUser,
        sendOTPSMS:sendOTPSMS,
        contact_us:contact_us

    }
});
