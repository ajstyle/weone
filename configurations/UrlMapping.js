module.exports = function(app) {
    var controllers = app.controllers,
        views = app.views;

    return {
        "/api/v2.0.0/app/user/generate/otp/:phonenumber": [{
            method: 'GET',
            action: controllers.userSessionController.generateOTP,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/verify/otp": [{
            method: 'POST',
            action: controllers.userSessionController.verifyOTP,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/verify/referralcode/:mobileNumber/:referred_id": [{
            method: "GET",
            action: controllers.referralController.verifyRefferalCode,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user": [{
            method: "POST",
            action: controllers.registrationController.createAppUser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }, {
            method: "put",
            action: controllers.userController.updateUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/details": [{
            method: 'GET',
            action: controllers.userSessionController.userInfo,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/network_tree": [{
            method: 'GET',
            action: controllers.userDataController.getNetworkTree,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/tree_level/:level/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.getTreeLevel,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/friends": [{
            method: 'GET',
            action: controllers.userController.getUserFriends,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/update/contacts": [{
            method: 'POST',
            action: controllers.chatController.updateContacts,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/advert/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.getUserAdvertisement,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/advert/view/normal": [{
            method: 'POST',
            action: controllers.advertController.viewOnAdvert,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/advert/view/complete": [{
            method: 'POST',
            action: controllers.advertController.completeViewOnAdvert,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/like/unlike": [{
            method: "PUT",
            action: controllers.advertController.likeUnlike,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/add/comment": [{
            method: "PUT",
            action: controllers.advertController.addComment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/edit/comment": [{
            method: 'POST',
            action: controllers.userController.edit_comments,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/delete/comment": [{
            method: 'PUT',
            action: controllers.userController.delete_comment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/profile/:userid": [{
            method: 'GET',
            action: controllers.userController.getUserProfile,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/otp/generate/:mobileNumber": [{
            method: "GET",
            action: controllers.registrationController.sendOTPSMS,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/device_details": [{
            method: 'POST',
            action: controllers.userSessionController.deviceDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/generate/otp": [{
            method: 'GET',
            action: controllers.authenticationController.generateOTP,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/generate/otp/update_email/:email": [{
            method: 'GET',
            action: controllers.authenticationController.otp_update_email,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/resend/verifyemail/:email": [{
            method: "GET",
            action: controllers.authenticationController.resendVerifyEmail,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/verify/otp/update_email": [{
            method: 'POST',
            action: controllers.userController.update_email,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/upload/media": [{
            method: "POST",
            action: controllers.userController.uploadImage,
            middleware: [configurationHolder.security.authority("user"), multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/otp/verify": [{
            method: "POST",
            action: controllers.authenticationController.verifyOTP,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/contact_us": [{
            method: "POST",
            action: controllers.registrationController.contact_us,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/history/vouchers/:skip/:limit": [{
            method: 'GET',
            action: controllers.userController.getVouchers,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/generate/receipt": [{
            method: 'POST',
            action: controllers.userDataController.generateReceipt,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/receipt/amount": [{
            method: 'POST',
            action: controllers.userController.getReceiptAmount,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/receipt/filling_details": [{
            method: 'GET',
            action: controllers.userDataController.getReceiptFillingDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/advertAnalytic/:advertid/:analytic_type": [{
            method: "GET",
            action: controllers.advertController.updateAdvertAanlytics,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/rewards/:skip/:limit": [{
            method: 'GET',
            action: controllers.moneyController.getRewardOfUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/getUserBankDetailByToken": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetailByToken,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/settings": [{
            method: 'PUT',
            action: controllers.userController.userSettings,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/status/delete_request": [{
            method: 'GET',
            action: controllers.userController.delete_request_status,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/block/unblock": [{
            method: 'POST',
            action: controllers.userController.blockUnblockUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'GET',
            action: controllers.userController.getBlockList,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/lastseen/:userid": [{
            method: 'GET',
            action: controllers.userController.getUserLastSeen,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/lastseen": [{
            method: 'PUT',
            action: controllers.userController.userLastSeen,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/bank/account": [{
            method: 'POST',
            action: controllers.moneyController.savePaymentInfo,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'GET',
            action: controllers.moneyController.getUserAccountDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/chat/create/channel": [{
            method: 'POST',
            action: controllers.chatController.createChatChannel,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/notification": [{
            method: 'GET',
            action: controllers.moneyController.getNotificationUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/request/delete": [{
            method: 'PUT',
            action: controllers.userController.deleteRequest,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/reset/badge_count_ios/:type": [{
            method: 'GET',
            action: controllers.authenticationController.reset_badge_count,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/get_server_status": [{
            method: 'GET',
            middleware: [configurationHolder.security.serverStatus()],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/create/pin/:pin": [{
            method: 'GET',
            action: controllers.userSessionController.createUserPin,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/verify/pincode/:pincode": [{
            method: 'GET',
            action: controllers.newUserController.verifyPincode,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/update/pin/:pin": [{
            method: 'GET',
            action: controllers.userSessionController.updateUserPin,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/advert/like/:entryid/:flag": [{
            method: 'GET',
            action: controllers.userSessionController.likeUnlike,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/media/upload": [{
            method: "POST",
            action: controllers.userSessionController.uploadMedia,
            middleware: [configurationHolder.security.authority("user"), multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/check/availability/:phonenumber": [{
            method: "GET",
            action: controllers.userSessionController.isPhonenumberAvail,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/change/phonenumber/:phonenumber": [{
            method: "GET",
            action: controllers.userSessionController.updatePhonenumber,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/request/account/delete/:pin/:status": [{
            method: "GET",
            action: controllers.userSessionController.setDeleteRequest,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/check/existense/:phonenumber": [{
            method: 'GET',
            action: controllers.userSessionController.getUserExistence,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/get/version/details/:current_version": [{
            method: 'GET',
            action: controllers.userSessionController.isVersionUpdated,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/update/version/details/:current_version/:platform": [{
            method: 'GET',
            action: controllers.userSessionController.updateVersion,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/location": [{
            method: 'GET',
            action: controllers.userSessionController.smsCountryRes,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/isverified/phonenumber/:phonenumber": [{
            method: 'GET',
            action: controllers.userSessionController.isPhonenumberVerified,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/isverified/new/phonenumber/:phonenumber": [{
            method: 'GET',
            action: controllers.userSessionController.isNewPhonenumberVerified,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],



        //Admin APIs

        "/api/v2.0.0/admin/user/register": [{
            method: "POST",
            action: controllers.registrationController.createAdminUser,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/login": [{
            method: "POST",
            action: controllers.authenticationController.userLogin,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/admin/user/logout": [{
            method: "DELETE",
            action: controllers.authenticationController.userLogout,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/:role/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.getAllUserAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/adminPanel/user/:role/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.getAllUserAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/search/:email/:skip/:limit/:role": [{
            method: "GET",
            action: controllers.userController.searchAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/password/forgot/:email": [{
            method: "GET",
            action: controllers.authenticationController.forgotPassword,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advert": [{
            method: "POST",
            action: controllers.advertController.createAdvertisment,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advert/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.getAllAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advert/search/:name/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.searchUserAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advert/:advertid": [{
            method: "PUT",
            action: controllers.advertController.editAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }, {
            method: "DELETE",
            action: controllers.advertController.deleteAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        //API used for getting viewuser and click user count
        "/api/v2.0.0/advert/:id/:type": [{
            method: 'GET',
            action: controllers.moneyController.getClickViewUser,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/checkemail/:email/:role": [{
            method: "GET",
            action: controllers.userController.checkEmailExistance,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/rewards": [{
            method: 'POST',
            action: controllers.moneyController.createRewardsForAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'put',
            action: controllers.moneyController.updateRewards,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }], //delete the reward
        "/api/v2.0.0/admin/rewards": [{
            method: 'PUT',
            action: controllers.moneyController.deleteRewards,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/rewards/:skip/:limit": [{
            method: 'GET',
            action: controllers.moneyController.getRewardListForAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/client/bill": [{
            method: 'POST',
            action: controllers.moneyController.getClientMoneyDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/earning/:date/:limit/:skip": [{
            method: 'GET',
            action: controllers.moneyController.getUserPerDayEarning,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/dashboard": [{
            method: 'GET',
            action: controllers.advertController.dashBoardData,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/locations": [{
            method: 'GET',
            action: controllers.advertController.getLocations,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/revenue": [{
            method: 'GET',
            action: controllers.moneyController.getAdminRevenue,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/upload/advertisment": [{
            method: "POST",
            action: controllers.advertController.videoUpload,
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/video/token": [{
            method: "POST",
            action: controllers.advertController.generateVideotoken,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/beneficiary/export": [{
            method: 'GET',
            action: controllers.importExportController.getBeneficiaryDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/beneficiary/import": [{
            method: 'POST',
            action: controllers.importExportController.importBeneficiaryDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/transaction/export": [{
            method: 'GET',
            action: controllers.importExportController.exportTransactionDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/transaction/import": [{
            method: 'POST',
            action: controllers.importExportController.importTransactionDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/excel/history/:action/:skip/:limit": [{
            method: 'GET',
            action: controllers.importExportController.getExcelHistoryList,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/beneficiary/excel/error": [{
            method: 'GET',
            action: controllers.importExportController.getErrorBeneficiaryList,
            middleware: [configurationHolder.security.authority("delegatedAdmin"), multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/tree/:userid": [{
            method: 'GET',
            action: controllers.moneyController.showTreeOnAdmin,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/server/api/v2.0.0/admin/password/reset": [{
            method: "PUT",
            action: controllers.authenticationController.resetPassword,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/server/api/v2.0.0/verify/:token": [{
            method: "GET",
            action: controllers.authenticationController.verifyLink,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/global_push_notifications": [{
            method: 'POST',
            action: controllers.userController.sendGlobalPushNotifications,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/get/delete_requests/:limit/:skip": [{
            method: 'GET',
            action: controllers.userController.fetch_delete_requests,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/set_delete_request": [{
            method: 'POST',
            action: controllers.userController.set_delete_requests,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/delete/comment": [{
            method: 'PUT',
            action: controllers.userController.delete_comment,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/users/comments/show_all/:advertisement_id": [{
            method: 'GET',
            action: controllers.advertController.show_all_comments,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/locations_with_city/:advertisement_id/:skip/:limit": [{
            method: 'GET',
            action: controllers.advertController.getLocationsAndCities,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/generate/referral_ids": [{
            method: 'GET',
            action: controllers.referralController.generateReferralIdsScript,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/get/user/tree/:user_id": [{
            method: 'GET',
            action: controllers.advertController.getUserTree,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/get/payment_requests/:type/:limit/:skip": [{
            method: 'GET',
            action: controllers.userDataController.getUserRequests,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/set_payment_request": [{
            method: 'POST',
            action: controllers.userDataController.setUserRequest,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/getUserBankDetail/:skip/:limit": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetail,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/getVoucherDetails/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.getVoucherDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/voucherWithUserId/:userId/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.voucherWithUserId,
            //  middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/getUserBankDetailById/:id": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetailById,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/viewVoucherOfUser/:id": [{
            method: 'GET',
            action: controllers.userDataController.viewVoucherOfUser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/vouchers/export": [{
            method: 'POST',
            action: controllers.importExportController.exportVoucherDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/vouchers/import": [{
            method: 'POST',
            action: controllers.importExportController.importVoucherDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/searchAdminWithBankingDetails/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.searchAdminWithBankingDetails,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/searchAdminWithVoucherDetails/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.searchAdminWithVoucherDetails,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/searchUserIncome/:email/:date/:limit/:skip": [{
            method: 'GET',
            action: controllers.moneyController.searchUserIncome,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/searchUsersInDeleteRequest/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userDataController.searchUsersInDeleteRequest,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/searchUsersInPaymentRequest/:type/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userDataController.searchUsersInPaymentRequest,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/panel/user/:role/:skip/:limit": [{

            method: "GET",
            action: controllers.userController.getAllUserAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/panel/user/:role/:skip/:limit/:date": [{
            method: "GET",
            action: controllers.userController.getAllUserAdminPanel,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/adminPanel/user/:role/:skip/:limit/:date": [{
            method: "GET",
            action: controllers.chatController.getInviteList,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/user/locations_with_states/:advertisement_id": [{
            method: 'GET',
            action: controllers.advertController.getLocationsAndStates,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/adminPanel/user/locationsBySearchState/:advertisement_id/:state": [{
            method: 'GET',
            action: controllers.advertController.getLocationBySearchState,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertDetails/:advertid": [{
            method: "GET",
            action: controllers.advertController.getAdvertisementDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/advertAnalytic/:advertid/:analytic_type": [{
            method: "GET",
            action: controllers.advertController.updateAdvertAanlytics,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/clients": [{
            method: 'GET',
            action: controllers.advertController.getTopClients,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertisements": [{
            method: 'GET',
            action: controllers.advertController.getTopAdvertisements,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertisements/charges": [{
            method: 'GET',
            action: controllers.advertController.getAdvertisementsCharges,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/script/delete/user/by_id/:id": [{
            method: 'GET',
            action: controllers.userSessionController.deleteById,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/script/get/authtoken/by_user_phonenumber/:phonenumber": [{
            method: 'GET',
            action: controllers.userSessionController.getAuthByPhonenumber,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],





























        "/api/v1.1/app/otp/generate/:mobileNumber": [{
            method: "GET",
            action: controllers.registrationController.sendOTPSMS,
            // action: controllers.registrationController.stopRegistrations,
            // middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/otp/generate/:mobileNumber": [{
            method: "GET",
            action: controllers.registrationController.sendOTPSMS,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/otp/verify": [{
            method: "POST",
            action: controllers.authenticationController.verifyOTP,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/app/user": [{
            method: "POST",
            action: controllers.registrationController.createAppUser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }, {
            method: "put",
            action: controllers.userController.updateUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        //put because we are updating user in this case not deleting completly
        "/api/v1.1/app/user/delete": [{
            method: "PUT",
            action: controllers.authenticationController.deleteAccount,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],




        "/api/v1.1/app/user/comment": [{
            method: "PUT",
            action: controllers.advertController.advertisementComment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/like/unlike": [{
            method: "PUT",
            action: controllers.advertController.likeUnlike,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/app/user/invite": [{
            method: "POST",
            action: controllers.userController.sendInvitation,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],


        "/api/v1.1/app/user/upload/media": [{
            method: "POST",
            action: controllers.userController.uploadImage,
            middleware: [configurationHolder.security.authority("user"), multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],


        "/api/v1.1/app/user/comment/:entryid": [{
            method: "GET",
            action: controllers.advertController.getComment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/app/user/click": [{
            method: 'POST',
            action: controllers.advertController.clickOnCount,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/app/user/advert/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.getUserAdvertisement,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/advert/view/normal": [{
            method: 'POST',
            action: controllers.advertController.viewOnAdvert,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/advert/view/complete": [{
            method: 'POST',
            action: controllers.advertController.completeViewOnAdvert,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/networkstatus": [{
            method: 'GET',
            action: controllers.advertController.networkStatus,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/app/user/rewards/:skip/:limit": [{
            method: 'GET',
            action: controllers.moneyController.getRewardOfUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        // "/api/v1.1.1/app/user/phonebook": [{
        //    method: 'POST',
        //    action: controllers.userController.getUserContactsList,
        //    middleware: [configurationHolder.security.authority("user")],
        //    views: {
        //        json: views.jsonView
        //    }
        //  }],

        "/api/v1.1/app/user/friends": [{
            method: 'GET',
            action: controllers.userController.getUserFriends,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/home": [{
            method: 'GET',
            action: controllers.moneyController.getUserNetworkMoneyVideos,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/appstatus/:status": [{
            method: 'GET',
            action: controllers.userController.appStatus,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/settings": [{
            method: 'PUT',
            action: controllers.userController.userSettings,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/profile/:userid": [{
            method: 'GET',
            action: controllers.userController.getUserProfile,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/block/unblock": [{
            method: 'POST',
            action: controllers.userController.blockUnblockUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'GET',
            action: controllers.userController.getBlockList,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/notification": [{
            method: 'GET',
            action: controllers.moneyController.getNotificationUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/newmediacount": [{
            method: 'GET',
            action: controllers.advertController.getNewVideo,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/lastseen": [{
            method: 'PUT',
            action: controllers.userController.userLastSeen,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/lastseen/:userid": [{
            method: 'GET',
            action: controllers.userController.getUserLastSeen,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/bank/account": [{
            method: 'POST',
            action: controllers.moneyController.saveAccountDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'GET',
            action: controllers.userController.getUserBankDetailByToken,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/request/delete": [{
            method: 'PUT',
            action: controllers.userController.deleteRequest,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/generate/otp": [{
            method: 'GET',
            action: controllers.authenticationController.generateOTP,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/generate/otp/update_email/:email": [{
            method: 'GET',
            action: controllers.authenticationController.otp_update_email,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/verify/otp/update_email": [{
            method: 'POST',
            action: controllers.userController.update_email,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/status/delete_request": [{
            method: 'GET',
            action: controllers.userController.delete_request_status,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/edit/comment": [{
            method: 'POST',
            action: controllers.userController.edit_comments,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/delete/comment": [{
            method: 'PUT',
            action: controllers.userController.delete_comment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/reset/badge_count_ios/:type": [{
            method: 'GET',
            action: controllers.authenticationController.reset_badge_count,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/contact_us": [{
            method: "POST",
            action: controllers.registrationController.contact_us,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/verify/referralcode/:mobileNumber/:referred_id": [{
            method: "GET",
            action: controllers.referralController.verifyRefferalCode,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/update/user_info": [{
            method: "POST",
            action: controllers.authenticationController.userInfo,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/request/payment": [{
            method: "GET",
            action: controllers.userDataController.setPaymentRequest,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        // "/api/v1.1/app/user/get/invite_list": [{
        //    method: "GET",
        //    action: controllers.userDataController.getInviteList,
        //    middleware: [configurationHolder.security.authority("user")],
        //    views: {
        //        json: views.jsonView
        //    }
        //  }],

        "/api/v1.1/app/resend/verifyemail/:email": [{
            method: "GET",
            action: controllers.authenticationController.resendVerifyEmail,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/app/user/get/network_tree": [{
            method: 'GET',
            action: controllers.userDataController.getNetworkTree,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/generate/voucher": [{
            method: 'POST',
            action: controllers.userController.generateVoucher,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/get/history/vouchers/:skip/:limit": [{
            method: 'GET',
            action: controllers.userController.getVouchers,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/get/receipt/amount": [{
            method: 'POST',
            action: controllers.userController.getReceiptAmount,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/get/receipt/filling_details": [{
            method: 'GET',
            action: controllers.userDataController.getReceiptFillingDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/generate/receipt": [{
            method: 'POST',
            action: controllers.userDataController.generateReceipt,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/get/tree_level/:level/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.getTreeLevel,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/admin/get/tree_level/:level/:id/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.getTreeLevelAdmin,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/getUserBankDetailByToken": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetailByToken,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        //
        //Api's for admin side

        "/api/v1.1/admin/user/register": [{
            method: "POST",
            action: controllers.registrationController.createAdminUser,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/login": [{
            method: "POST",
            action: controllers.authenticationController.userLogin,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/admin/user/logout": [{
            method: "DELETE",
            action: controllers.authenticationController.userLogout,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],


        //        "/api/v1.1/adminPanel/user/:role/:skip/:limit": [{

        "/api/v1.1/admin/user/:role/:skip/:limit": [{

            method: "GET",
            action: controllers.userController.getAllUserAdminPanel,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/:role/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.getAllUserAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/adminPanel/user/:role/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.getAllUserAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/search/:email/:skip/:limit/:role": [{
            method: "GET",
            action: controllers.userController.searchAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],



        "/api/v1.1/admin/password/forgot/:email": [{
            method: "GET",
            action: controllers.authenticationController.forgotPassword,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],




        "/api/v1.1/admin/advert": [{
            method: "POST",
            action: controllers.advertController.createAdvertisment,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/advert/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.getAllAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/advert/search/:name/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.searchUserAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/admin/advert/:advertid": [{
            method: "PUT",
            action: controllers.advertController.editAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }, {
            method: "DELETE",
            action: controllers.advertController.deleteAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        //API used for getting viewuser and click user count
        "/api/v1.1/advert/:id/:type": [{
            method: 'GET',
            action: controllers.moneyController.getClickViewUser,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/checkemail/:email/:role": [{
            method: "GET",
            action: controllers.userController.checkEmailExistance,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/rewards": [{
            method: 'POST',
            action: controllers.moneyController.createRewardsForAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'put',
            action: controllers.moneyController.updateRewards,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }], //delete the reward
        "/api/v1.1/admin/rewards": [{
            method: 'PUT',
            action: controllers.moneyController.deleteRewards,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/rewards/:skip/:limit": [{
            method: 'GET',
            action: controllers.moneyController.getRewardListForAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/client/bill": [{
            method: 'POST',
            action: controllers.moneyController.getClientMoneyDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/earning/:date/:limit/:skip": [{
            method: 'GET',
            action: controllers.moneyController.getUserPerDayEarning,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/dashboard": [{
            method: 'GET',
            action: controllers.advertController.dashBoardData,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/locations": [{
            method: 'GET',
            action: controllers.advertController.getLocations,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/revenue": [{
            method: 'GET',
            action: controllers.moneyController.getAdminRevenue,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],




        //this method is just for testing purpose
        "/api/v1.1/convertvideo": [{
            method: "GET",
            action: controllers.videotranscodingController.videoConvert,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/admin/upload/advertisment": [{
            method: "POST",
            action: controllers.advertController.videoUpload,
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/video/token": [{
            method: "POST",
            action: controllers.advertController.generateVideotoken,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/admin/beneficiary/export": [{
            method: 'GET',
            action: controllers.importExportController.getBeneficiaryDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/beneficiary/import": [{
            method: 'POST',
            action: controllers.importExportController.importBeneficiaryDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/transaction/export": [{
            method: 'GET',
            action: controllers.importExportController.exportTransactionDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/transaction/import": [{
            method: 'POST',
            action: controllers.importExportController.importTransactionDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/excel/history/:action/:skip/:limit": [{
            method: 'GET',
            action: controllers.importExportController.getExcelHistoryList,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/beneficiary/excel/error": [{
            method: 'GET',
            action: controllers.importExportController.getErrorBeneficiaryList,
            middleware: [configurationHolder.security.authority("delegatedAdmin"), multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/tree/:userid": [{
            method: 'GET',
            action: controllers.moneyController.showTreeOnAdmin,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/server/api/v1.1/admin/password/reset": [{
            method: "PUT",
            action: controllers.authenticationController.resetPassword,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/server/api/v1.1/verify/:token": [{
            method: "GET",
            action: controllers.authenticationController.verifyLink,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/user/add/under_inviter_tree": [{
            method: 'POST',
            action: controllers.userController.addUnderInviter,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/global_push_notifications": [{
            method: 'POST',
            action: controllers.userController.sendGlobalPushNotifications,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/get/delete_requests/:limit/:skip": [{
            method: 'GET',
            action: controllers.userController.fetch_delete_requests,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/set_delete_request": [{
            method: 'POST',
            action: controllers.userController.set_delete_requests,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/delete/comment": [{
            method: 'PUT',
            action: controllers.userController.delete_comment,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/users/comments/show_all/:advertisement_id": [{
            method: 'GET',
            action: controllers.advertController.show_all_comments,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/locations_with_city/:advertisement_id/:skip/:limit": [{
            method: 'GET',
            action: controllers.advertController.getLocationsAndCities,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1.1/generate/referral_ids": [{
            method: 'GET',
            action: controllers.referralController.generateReferralIdsScript,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/get/user/tree/:user_id": [{
            method: 'GET',
            action: controllers.advertController.getUserTree,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/get/payment_requests/:type/:limit/:skip": [{
            method: 'GET',
            action: controllers.userDataController.getUserRequests,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/set_payment_request": [{
            method: 'POST',
            action: controllers.userDataController.setUserRequest,
            middleware: [configurationHolder.security.authority("admin")],
            views: {
                json: views.jsonView
            }
        }],
        // Previous version API'S

        "/api/v1/registeruser": [{
            method: "POST",
            action: controllers.registrationController.createAppUser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/registeruserforadmin": [{
            method: "POST",
            action: controllers.registrationController.createAdminUser,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/generateotp/:mobileNumber": [{
            method: "GET",
            action: controllers.registrationController.sendOTPSMS,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/verifyotp": [{
            method: "POST",
            action: controllers.authenticationController.verifyOTP,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],


        "/api/v1/userlogin": [{
            method: "POST",
            action: controllers.authenticationController.userLogin,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/forgotpassword/:email": [{
            method: "GET",
            action: controllers.authenticationController.forgotPassword,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/server/api/v1/resetpassword": [{
            method: "PUT",
            action: controllers.authenticationController.resetPassword,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/server/api/v1/verify/:token": [{
            method: "GET",
            action: controllers.authenticationController.verifyLink,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/logout": [{
            method: "DELETE",
            action: controllers.authenticationController.userLogout,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/getalluseradmin/:role/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.getAllUserAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/searchadmin/:email/:skip/:limit/:role": [{
            method: "GET",
            action: controllers.userController.searchAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/advertisement": [{
            method: "POST",
            action: controllers.advertController.createAdvertisment,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/getadvertisement/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.getAllAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/advertisement/:name/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.searchUserAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/advertisement/:advertid": [{
            method: "PUT",
            action: controllers.advertController.editAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }, {
            method: "DELETE",
            action: controllers.advertController.deleteAdvertisement,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/checkemail/:email/:role": [{
            method: "GET",
            action: controllers.userController.checkEmailExistance,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/rewards": [{
            method: 'POST',
            action: controllers.moneyController.createRewardsForAdmin,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/client/bill": [{
            method: 'POST',
            action: controllers.moneyController.getClientMoneyDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/advertisement/user/:id/:type": [{
            method: 'GET',
            action: controllers.moneyController.getClickViewUser,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/earning/:date/:limit/:skip": [{
            method: 'GET',
            action: controllers.moneyController.getUserPerDayEarning,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/dashboard": [{
            method: 'GET',
            action: controllers.advertController.dashBoardData,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/locations": [{
            method: 'GET',
            action: controllers.advertController.getLocations,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/revenue": [{
            method: 'GET',
            action: controllers.moneyController.getAdminRevenue,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/deleteaccount": [{
            method: "PUT",
            action: controllers.authenticationController.deleteAccount,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/uploadimage": [{
            method: "POST",
            action: controllers.userController.uploadImage,
            middleware: [configurationHolder.security.authority("user"), multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/userupdate": [{
            method: "put",
            action: controllers.userController.updateUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        //this method is just for testing purpose
        "/api/v1/convertvideo": [{
            method: "GET",
            action: controllers.videotranscodingController.videoConvert,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/uploadadvertisment": [{
            method: "POST",
            action: controllers.advertController.videoUpload,
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/user/advertisement/:skip/:limit": [{
            method: "GET",
            action: controllers.advertController.getUserAdvertisement,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],


        "/api/v1/user/comment": [{
            method: "PUT",
            action: controllers.advertController.advertisementComment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/likeunlike": [{
            method: "PUT",
            action: controllers.advertController.likeUnlike,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/user/invite": [{
            method: "POST",
            action: controllers.userController.sendInvitation,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/generateVideoToken": [{
            method: "POST",
            action: controllers.advertController.generateVideotoken,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/comment/:entryid": [{
            method: "GET",
            action: controllers.advertController.getComment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/click": [{
            method: 'POST',
            action: controllers.advertController.clickOnCount,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/view": [{
            method: 'POST',
            action: controllers.advertController.viewOnAdvert,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/completeview": [{
            method: 'POST',
            action: controllers.advertController.completeViewOnAdvert,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/networkstatus": [{
            method: 'GET',
            action: controllers.advertController.networkStatus,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v1/user/rewards/:skip/:limit": [{
            method: 'GET',
            action: controllers.moneyController.getRewardOfUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        // "/api/v1.1.1/user/phonebook": [{
        //    method: 'POST',
        //    action: controllers.userController.getUserContactsList,
        //    middleware: [configurationHolder.security.authority("user")],
        //    views: {
        //        json: views.jsonView
        //    }
        //  }],

        "/api/v1.1.1/user/friends": [{
            method: 'GET',
            action: controllers.userController.getUserFriends,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/home": [{
            method: 'GET',
            action: controllers.moneyController.getUserNetworkMoneyVideos,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/appstatus/:status": [{
            method: 'GET',
            action: controllers.userController.appStatus,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/setting": [{
            method: 'PUT',
            action: controllers.userController.userSettings,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/profile/:userid": [{
            method: 'GET',
            action: controllers.userController.getUserProfile,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/block": [{
            method: 'POST',
            action: controllers.userController.blockUnblockUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'GET',
            action: controllers.userController.getBlockList,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/notification/:timestamp": [{
            method: 'GET',
            action: controllers.moneyController.getNotificatonUser,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/newmediacount": [{
            method: 'GET',
            action: controllers.advertController.getNewVideo,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/lastseen": [{
            method: 'PUT',
            action: controllers.userController.userLastSeen,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/lastseen/:userid": [{
            method: 'GET',
            action: controllers.userController.getUserLastSeen,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/account": [{
            method: 'POST',
            action: controllers.moneyController.saveAccountDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }, {
            method: 'GET',
            action: controllers.moneyController.getUserAccountDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/beneficiary/export": [{
            method: 'GET',
            action: controllers.importExportController.getBeneficiaryDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1/user/usertree": [{
            method: 'GET',
            action: controllers.moneyController.showTreeOnAdmin,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        //scripts
        "/api/v1/script/url_change": [{
            method: 'GET',
            action: controllers.authenticationController.url_change,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/get_server_status": [{
            method: 'GET',
            //  action: controllers.authenticationController.getServerStatus,
            middleware: [configurationHolder.security.serverStatus()],
            views: {
                json: views.jsonView
            }
        }],
        "/api/neo4j/add/users_to_tree": [{
            method: 'GET',
            action: controllers.authenticationController.addUsersToTree,
            //        middleware: [configurationHolder.security.authority("serverStatus")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/neo4j/add/orphaned_users": [{
            method: 'GET',
            action: controllers.authenticationController.addOrphanedUsers,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/script/add/inviter": [{
            method: 'GET',
            action: controllers.userDataController.addInviters,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/script/modify/tree": [{
            method: 'GET',
            action: controllers.userDataController.modifyTreeStructure,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/getAndUpdateReferralIdsScript": [{
            method: 'GET',
            action: controllers.referralController.getAndUpdateReferralIdsScript,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/script/tree/remove_cycle": [{
            method: 'GET',
            action: controllers.userDataController.removeCycleFromTree,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/script/develop/mlm_v2_tree": [{
            method: 'GET',
            action: controllers.userDataController.developMLMTree,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/script/generate/network_tree/:id": [{
            method: 'GET',
            action: controllers.userDataController.scriptGenerateNetworkTree,
            // middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/getUserBankDetail/:skip/:limit": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetail,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/getVoucherDetails/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.getVoucherDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/voucherWithUserId/:userId/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.voucherWithUserId,
            // middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/getUserBankDetailById/:id": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetailById,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/viewVoucherOfUser/:id": [{
            method: 'GET',
            action: controllers.userDataController.viewVoucherOfUser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/vouchers/export": [{
            method: 'POST',
            action: controllers.importExportController.exportVoucherDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/vouchers/import": [{
            method: 'POST',
            action: controllers.importExportController.importVoucherDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/getVoucherDetails/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.getVoucherDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/voucherWithUserId/:userId/:skip/:limit": [{
            method: 'GET',
            action: controllers.userDataController.voucherWithUserId,
            //  middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/getUserBankDetailById/:id": [{
            method: 'GET',
            action: controllers.userController.getUserBankDetailById,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/viewVoucherOfUser/:id": [{
            method: 'GET',
            action: controllers.userDataController.viewVoucherOfUser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/vouchers/export": [{
            method: 'POST',
            action: controllers.importExportController.exportVoucherDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/vouchers/import": [{
            method: 'POST',
            action: controllers.importExportController.importVoucherDetails,
            // middleware: [configurationHolder.security.authority("delegatedAdmin"),multipartMiddleware],
            middleware: [multipartMiddleware],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/searchAdminWithBankingDetails/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.searchAdminWithBankingDetails,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/searchAdminWithVoucherDetails/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userController.searchAdminWithVoucherDetails,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/searchUserIncome/:email/:date/:limit/:skip": [{
            method: 'GET',
            action: controllers.moneyController.searchUserIncome,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/searchUsersInDeleteRequest/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userDataController.searchUsersInDeleteRequest,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/searchUsersInPaymentRequest/:type/:email/:skip/:limit": [{
            method: "GET",
            action: controllers.userDataController.searchUsersInPaymentRequest,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        // "/api/v1.1/app/user/update/phonebook": [{
        //    method: 'POST',
        //    action: controllers.chatController.getUserContactsList,
        //    middleware: [configurationHolder.security.authority("user")],
        //    views: {
        //        json: views.jsonView
        //    }
        // }],
        "/api/v1.1/app/user/chat/create/channel": [{
            method: 'POST',
            action: controllers.chatController.createChatChannel,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        ///////////////////////////////////////////////////////////////
        //                                                           //
        //          New Version APIs v1.2 starts from here           //
        //                                                           //
        //                                                           //
        ///////////////////////////////////////////////////////////////


        // "/api/v1.1.1/app/user/update/phonebook": [{
        //    method: 'POST',
        //    action: controllers.chatController.getUserContactsList,
        //    middleware: [configurationHolder.security.authority("user")],
        //    views: {
        //        json: views.jsonView
        //    }
        // }],
        "/api/v1.1/app/user/chat/create/channel": [{
            method: 'POST',
            action: controllers.chatController.createChatChannel,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/demo/function": [{
            method: 'GET',
            action: controllers.chatController.default_fn,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/panel/user/:role/:skip/:limit/:date": [{
            method: "GET",
            action: controllers.userController.getAllUserAdminPanel,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/earningDetails/:userid": [{
            method: 'GET',
            action: controllers.userDataController.getEarningDetails,
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/add/comment": [{
            method: "PUT",
            action: controllers.advertController.addComment,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/user/get/list/invite/:timestamp": [{
            method: "GET",
            action: controllers.chatController.getInviteList,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/update/contacts": [{
            method: 'POST',
            action: controllers.chatController.updateContacts,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/adminPanel/user/:role/:skip/:limit/:date": [{
            method: "GET",
            action: controllers.chatController.getInviteList,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/app/user/update/contacts": [{
            method: 'POST',
            action: controllers.chatController.updateContacts,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/user/locations_with_states/:advertisement_id": [{
            method: 'GET',
            action: controllers.advertController.getLocationsAndStates,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/adminPanel/user/locationsBySearchState/:advertisement_id/:state": [{
            method: 'GET',
            action: controllers.advertController.getLocationBySearchState,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/admin/advertDetails/:advertid": [{
            method: "GET",
            action: controllers.advertController.getAdvertisementDetails,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v1.1/app/advertAnalytic/:advertid/:analytic_type": [{
            method: "GET",
            action: controllers.advertController.updateAdvertAanlytics,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/admin/clients": [{
            method: 'GET',
            action: controllers.advertController.getTopClients,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertisements": [{
            method: 'GET',
            action: controllers.advertController.getTopAdvertisements,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/admin/advertisements/charges": [{
            method: 'GET',
            action: controllers.advertController.getAdvertisementsCharges,
            middleware: [configurationHolder.security.authority("delegatedAdmin")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/app/user/generate/otp/:phonenumber": [{
            method: 'GET',
            action: controllers.userSessionController.generateOTP,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/app/user/verify/otp": [{
            method: 'POST',
            action: controllers.userSessionController.verifyOTP,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/app/user/get/device_details": [{
            method: 'POST',
            action: controllers.userSessionController.deviceDetails,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/app/user/get/details": [{
            method: 'GET',
            action: controllers.userSessionController.userInfo,
            middleware: [configurationHolder.security.authority("user")],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/script/generate/mlm/by_user_phonenumber/:phonenumber": [{
            method: "GET",
            action: controllers.scriptController.generateMLM,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/script/generate/tree/by_user_phonenumber/:phonenumber": [{
            method: "GET",
            action: controllers.scriptController.generateTree,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/admin/get/income_by_date/:date": [{
            method: "GET",
            action: controllers.advertController.getIncomeByDate,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/admin/update/income/:id/:amount": [{
            method: "GET",
            action: controllers.advertController.updateIncome,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        /*
        weone advertisers APIs for advertiser section
        */
        "/api/v2.0.0/admin/advertisers": [{
            method: "GET",
            action: controllers.advertiserController.getAdvertiser,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertiser/approve/:userId": [{
            method: "GET",
            action: controllers.advertiserController.updateAdvertiserStatus,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertiser/approve/status/:userId": [{
            method: "GET",
            action: controllers.advertiserController.updateAdvertiserStatusRejected,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/advertisers/activity": [{
            method: "GET",
            action: controllers.advertiserController.getActivityList,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

        "/api/v2.0.0/admin/settings/activity_price/:item": [{
            method: "POST",
            action: controllers.activityPriceController.savePrice,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],
        "/api/v2.0.0/admin/settings/activity_price": [{
            method: "GET",
            action: controllers.activityPriceController.getValue,
            middleware: [],
            views: {
                json: views.jsonView
            }
        }],

    };
};
