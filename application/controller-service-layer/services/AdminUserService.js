var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
AdminUserService = function(app) {
    this.app = app;
};

AdminUserService.prototype = new BaseService();
/*
This method is used to search the admin user/app user.It is regex based searching.
@limit @skip is used for paggination
@email:email,phonenumber,name based regex searching
@role:identify the role user or admin
*/
AdminUserService.prototype.searchAdminService = function(email, skips, limits, role, callback) {
        //Logger.info('control in the search admin', typeof email, skips, limits)
        var email = (email == null || email == "") ? '.*' : email;
        Logger.info("email is", email);
        var sort = {
            _id: -1
        };
        if (role == "ROLE_ADMIN") {
            //Logger.info('control in the search the role admin');
            if (parseInt(email)) {
                // Logger("NO NaN");
                var buildQuery = function() {
                    return domain.User.find({
                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }, {
                            phonenumber: { $gte: parseInt(email) * Math.pow(10, 12 - email.length), $lte: (parseInt(email) + 1) * Math.pow(10, 12 - email.length) }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }],
                        deleted: false,
                        role: role,
                        $or: [{
                            role: "ROLE_ADMIN"
                        }, {
                            role: "ROLE_DELEGATED_ADMIN"
                        }]
                    });
                }
            } else {
                //Logger.info("YES NaN");
                var buildQuery = function() {
                    return domain.User.find({
                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }],
                        deleted: false,
                        role: role,
                        $or: [{
                            role: "ROLE_ADMIN"
                        }, {
                            role: "ROLE_DELEGATED_ADMIN"
                        }]
                    });
                }
            }
            executeQuery(buildQuery(), buildQuery(), skips, limits, sort, callback)
        } else {
            //Logger.info("Inside elseeeeeeeeeeeee  ",email," ",parseInt(email)*Math.pow(10,12-email.length)," ",(parseInt(email)+1)*Math.pow(10,12-email.length));
            //Logger.info('control in the search the role user');

            if (parseInt(email)) {
                // Logger.info("NO NAN");
                var buildQuery = function() {
                    return domain.User.find({
                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }, {
                            phonenumber: { $gte: parseInt(email) * Math.pow(10, 12 - email.length), $lte: (parseInt(email) + 1) * Math.pow(10, 12 - email.length) }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }],
                        deleted: false,
                        role: role
                    });
                }
            } else {
                // Logger.info("YES NAN");
                var buildQuery = function() {
                    return domain.User.find({
                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }],
                        deleted: false,
                        role: role
                    });
                }
            }
            executeQuery(buildQuery(), buildQuery(), skips, limits, sort, callback)
        }
    }
    /*This function is used to execute the query with paggination
    @query:different DB query @skips @limits for paggination @sorting in db
    */
var executeQuery = function(query, countQuery, skip, limit, sort, callback) {
        var object = {};
        query.skip(skip).limit(limit).sort(sort).exec(function(err, objects) {
            object.object = objects;
            if (skip == 0) {
                countQuery.count(function(err, count) {
                    object.count = count;
                    callback(err, SetResponse.setSuccess("", object));
                })
            } else {
                callback(err, SetResponse.setSuccess("", object));
            }
        })
    }
    /*This method is used to get all the user from with their role whether role is client,user or admin
    @limit @skip is used for paggination @role:it is used to provide the role base fetching
    */
AdminUserService.prototype.getAllUserServicePanel = function(date, role, limit, skip, callback) {
    //Logger.info(skip, "control in the service layer", limit);
    var object = {};
    var sort = {
        _id: -1
    };
    if (role == "ROLE_ADMIN") {
        var buildQuery = function() {
            return domain.User.find({
                deleted: false,
                $or: [{
                    role: "ROLE_ADMIN"
                }, {
                    role: "ROLE_DELEGATED_ADMIN"
                }]
            })
        }
        executeQuery(buildQuery(), buildQuery(), skip, limit, sort, callback);
    } else {
        // Logger.info("in else part");
        if (false) {
            var date = new Date(date);
            var isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
            var date1 = new Date(date);
            var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
            var isoDate1 = new Date(oneDayAfter.getTime() - oneDayAfter.getTimezoneOffset() * 60000).toISOString();
            var buildQuery = function() {
                return domain.User.find({
                    $and: [
                        { deleted: false },
                        { role: role },
                        { created: { $gt: isoDate, $lte: isoDate1 } }
                    ]
                });
            }
        } else {
            var buildQuery = function() {
                return domain.User.find({
                    deleted: false,
                    role: role
                }, { name: 1, gender: 1, phonenumber: 1, user_account: 1, email: 1, role: 1, date_of_birth: 1, referralId: 1, image_url: 1 });
            }
        }
        executeQuery(buildQuery(), buildQuery(), skip, limit, sort, callback);

    }
    /*This method is used to check the existing email accoriding to the role
    @email:email is used to searching the existing email
    @role:role based searching in the api
    */
    AdminUserService.prototype.checkEmailService = function(email, role, callback) {
        //Logger.info(role, "control in the service layer", email);
        if (role == 'ROLE_ADMIN') {
            var query = domain.User.findOne({
                email: email,
                $or: [{
                    role: 'ROLE_ADMIN'
                }, {
                    role: "ROLE_DELEGATED_ADMIN"
                }],
                deleted: false
            })
        } else {
            var query = domain.User.findOne({
                email: email,
                role: role,
                deleted: false
            });
        }
        query.exec(function(err, obj) {
            if (obj) {
                ////Logger.info('email exist');
                callback(err, SetResponse.setSuccess('exist', true));
            } else {
                //Logger.info('email not exist');
                callback(err, SetResponse.setSuccess('not exist', false));
            }
        });
    }


    AdminUserService.prototype.searchAdminServiceWithVoucherDetails = function(email, skip, limit, callback) {

        async.auto({
            findAllUserVouchers: function(next, results) {
                domain.Voucher.find({ endDate: { $ne: null }, amount: { $gt: 0 } }, function(err, vouchers) {
                    //  Logger.info("vouchers are",vouchers.length);
                    next(err, vouchers);
                });
            },
            getUserWithVoucher: ['findAllUserVouchers', function(next, results) {

                var userIds = results.findAllUserVouchers.map(function(voucher) {

                    return voucher.user_id;
                })
                if (parseInt(email)) {
                    domain.User.find({
                        _id: { $in: userIds },
                        phonenumber: { $gte: parseInt(email) * Math.pow(10, 12 - email.length), $lte: (parseInt(email) + 1) * Math.pow(10, 12 - email.length) }
                    }, function(err, objects) {
                        // Logger.info("objects are",objects);
                        var Id = objects.map(function(user) {

                            return user._id;

                        })

                        // Logger.info("objects are with results",results.findAllUserVouchers.length);
                        exexuteQueryInVoucherDetails(Id, skip, limit, callback);

                    })
                } else {
                    domain.User.find({
                        _id: { $in: userIds },

                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }]
                    }, function(err, objects) {
                        // Logger.info("objects are",objects);
                        var Id = objects.map(function(user) {

                            return user._id;

                        })
                        exexuteQueryInVoucherDetails(Id, skip, limit, callback);
                    })

                }

            }]

        })

    }




    var exexuteQueryInVoucherDetails = function(Id, skip, limit, callback) {
        var userResult = {};
        domain.Voucher.find({ user_id: { $in: Id }, endDate: { $ne: null }, amount: { $gt: 0 } })
            .skip(skip)
            .limit(limit)
            .sort('-created')
            .populate('user_id')
            .exec(function(err, response) {
                if (skip != 0) {
                    userResult.object = response;
                    callback(err, SetResponse.setSuccess('user with its voucher  details after search is', userResult));
                } else {
                    domain.Voucher.find({ user_id: { $in: Id }, endDate: { $ne: null }, amount: { $gt: 0 } }).count({}, function(err, count) {
                        // Logger.info("voucher results are in else part ");
                        userResult.count = count;
                        userResult.object = response;
                        callback(err, SetResponse.setSuccess('user with its voucher details after search is', userResult));
                    })
                }
            })

    }





    AdminUserService.prototype.searchAdminServiceWithBankingDetails = function(email, skips, limits, callback) {
        //Logger.info('control in the search admin', typeof email, skips, limits)
        var email = (email == null || email == "") ? '.*' : email;
        var sort = {
            _id: -1
        };

        if (parseInt(email)) {
            ////Logger("NO NaN");
            // Logger.info("email is numeric",email);
            var buildQueryInBankingDetails = function() {
                return domain.User_Account_Details.find({
                    $or: [{
                        party_name: { $regex: email, $options: 'i' }
                    }, {
                        email_id: { $regex: email, $options: 'i' }
                    }, {
                        mobile_no: { $gte: parseInt(email) * Math.pow(10, 10 - email.length), $lte: (parseInt(email) + 1) * Math.pow(10, 10 - email.length) }
                    }]


                });
            }
        } else {
            //Logger.info("YES NaN");
            var buildQueryInBankingDetails = function() {
                return domain.User_Account_Details.find({
                    $or: [{
                        party_name: { $regex: email, $options: 'i' }
                    }, {
                        email_id: { $regex: email, $options: 'i' }
                    }]
                });
            }
        }
        executeQueryInBankingDetails(buildQueryInBankingDetails(), buildQueryInBankingDetails(), skips, limits, sort, callback)
    }

    /*This function is used to execute the query with paggination
    @query:different DB query @skips @limits for paggination @sorting in db
    */
    var executeQueryInBankingDetails = function(query, countQuery, skip, limit, sort, callback) {
        var object = {};

        query.skip(skip).limit(limit).sort(sort).exec(function(err, objects) {
            object.object = objects;
            // Logger.info(" objects are after query is ",query);
            if (skip == 0) {
                countQuery.count(function(err, count) {
                    object.count = count;
                    callback(err, SetResponse.setSuccess("", object));
                })
            } else {
                callback(err, SetResponse.setSuccess("", object));
            }
        })
    }

    AdminUserService.prototype.searchUserIncome = function(date2, searchField, skip, limit, callback) {
        // Logger.info("date,email,skip and limit is ",date2,searchField,skip,limit);
        var userResult = {};
        var resultOfUser = {};
        var resultUser = [];
        async.auto({
            findAllUser: function(next, results) {
                domain.User.find({
                    $or: [{
                        name: { $regex: searchField, $options: 'i' }
                    }, {
                        email: { $regex: searchField, $options: 'i' }
                    }]
                }, function(err, objects) {
                    // Logger.info("objects are",objects);
                    next(err, objects);
                })

            },

            searchAllUserIncome: ['findAllUser', function(next, results) {
                var userIds = results.findAllUser.map(function(user) {

                        return user._id;
                    })
                    // Logger.info("userIds is ",userIds);
                if (date2 != 0) {
                    var date = new Date(date2);
                    var date1 = new Date(date2);
                    var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
                    domain.User_Earning_Bucket.find({
                            user_id: { $in: userIds },
                            date_of_earning: {
                                $gt: date,
                                $lte: oneDayAfter
                            }
                        })
                        .skip(skip)
                        .limit(limit)
                        .populate('user_id')
                        .exec(function(err, earnings) {
                            userResult.object = earnings;
                            // userResult.object.map(function(result){
                            //   Logger.info("result date is",result.date_of_earning);
                            //   domain.User_Earning_Bucket.aggregate({ $match: {
                            //       $and: [
                            //         {user_id:result.user_id},
                            //         { date_of_earning: { $gte:userResult.object[0].date_of_earning} },
                            //         {  date_of_earning: { $lte: result.date_of_earning }}
                            //       ]
                            //   } },
                            //   { $group: { _id : null, sum : { $sum: "$total_amount" } } },function(err,response){
                            //    result.total_amount=response[0].sum;
                            //     Logger.info("total amount with date is",result.total_amount);
                            //     resultOfUser.object=result;
                            //   });

                            // })
                            if (skip != 0) {
                                // Logger.info("earning are",userResult);
                                callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                            } else {
                                domain.User_Earning_Bucket.find({
                                    user_id: { $in: userIds },
                                    date_of_earning: {
                                        $gt: date,
                                        $lte: oneDayAfter
                                    }
                                }).count(function(err, count) {
                                    userResult.count = count;

                                    callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                                })
                            }
                        })
                } else {
                    domain.User_Earning_Bucket.find({ user_id: { $in: userIds } })
                        .sort({
                            date_of_earning: -1
                        })
                        .skip(skip)
                        .limit(limit)
                        .populate('user_id')
                        .exec(function(err, earnings) {
                            // Logger.info("earnings are ",earnings);
                            userResult.object = earnings;
                            //     userResult.object.map(function(result){
                            //       // Logger.info("result date is  ",result.date_of_earning);
                            //       domain.User_Earning_Bucket.aggregate({ $match: {
                            //          user_id:result.user_id._id,
                            //  date_of_earning: { $gte: new Date("2016-05-23T23:00:00.845Z"),$lte:  result.date_of_earning }} },
                            //
                            //       { $group: { _id : null, sum : { $sum: "$total_amount" } } },function(err,response){
                            //           // Logger.info("date is",result.date_of_earning);
                            //           // Logger.info("total amount without  date is",result.total_amount);
                            //        result.total_amount=response[0].sum;
                            //        Logger.info("response is",response);
                            //
                            //           // Logger.info("date is",userResult.object[0].date_of_earning);
                            //         resultUser.push(result);
                            //
                            //         // Logger.info("result of user ",resultOfUser);
                            //       });
                            //
                            //     })

                            if (skip != 0) {
                                callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                            } else {
                                domain.User_Earning_Bucket.find({ user_id: { $in: userIds } }).count(function(err, count) {
                                    userResult.count = count;

                                    callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                                })
                            }
                        })
                }
            }]
        })
    }

    AdminUserService.prototype.searchUserIncome1 = function(date2, searchField, skip, limit, callback) {
        // Logger.info("date,email,skip and limit is ",date2,searchField,skip,limit);
        var userResult = {};
        var resultOfUser = {};
        var resultUser = [];
        async.auto({
            findAllUser: function(next, results) {
                domain.User.find({
                    $or: [{
                        name: { $regex: searchField, $options: 'i' }
                    }, {
                        email: { $regex: searchField, $options: 'i' }
                    }]
                }, function(err, objects) {
                    // Logger.info("objects are",objects);
                    next(err, objects);
                })

            },

            searchAllUserIncome: ['findAllUser', function(next, results) {
                var userIds = results.findAllUser.map(function(user) {

                        return user._id;
                    })
                    // Logger.info("userIds is ",userIds);
                if (date2 != 0) {
                    var date = new Date(date2);
                    var date1 = new Date(date2);
                    var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
                    domain.User_Earning_Bucket.find({
                            user_id: { $in: userIds },
                            date_of_earning: {
                                $gt: date,
                                $lte: oneDayAfter
                            }
                        })
                        .skip(skip)
                        .limit(limit)
                        .populate('user_id')
                        .exec(function(err, earnings) {
                            userResult.object = earnings;
                            // userResult.object.map(function(result){
                            //   Logger.info("result date is",result.date_of_earning);
                            //   domain.User_Earning_Bucket.aggregate({ $match: {
                            //       $and: [
                            //         {user_id:result.user_id},
                            //         { date_of_earning: { $gte:userResult.object[0].date_of_earning} },
                            //         {  date_of_earning: { $lte: result.date_of_earning }}
                            //       ]
                            //   } },
                            //   { $group: { _id : null, sum : { $sum: "$total_amount" } } },function(err,response){
                            //    result.total_amount=response[0].sum;
                            //     Logger.info("total amount with date is",result.total_amount);
                            //     resultOfUser.object=result;
                            //   });

                            // })
                            if (skip != 0) {
                                // Logger.info("earning are",userResult);
                                callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                            } else {
                                domain.User_Earning_Bucket.find({
                                    user_id: { $in: userIds },
                                    date_of_earning: {
                                        $gt: date,
                                        $lte: oneDayAfter
                                    }
                                }).count(function(err, count) {
                                    userResult.count = count;

                                    callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                                })
                            }
                        })
                } else {
                    domain.User_Earning_Bucket.find({ user_id: { $in: userIds } })
                        .sort({
                            date_of_earning: -1
                        })
                        .skip(skip)
                        .limit(limit)
                        .populate('user_id')
                        .exec(function(err, earnings) {
                            // Logger.info("earnings are ",earnings);
                            userResult.object = earnings;
                            //     userResult.object.map(function(result){
                            //       // Logger.info("result date is  ",result.date_of_earning);
                            //       domain.User_Earning_Bucket.aggregate({ $match: {
                            //          user_id:result.user_id._id,
                            //  date_of_earning: { $gte: new Date("2016-05-23T23:00:00.845Z"),$lte:  result.date_of_earning }} },
                            //
                            //       { $group: { _id : null, sum : { $sum: "$total_amount" } } },function(err,response){
                            //           // Logger.info("date is",result.date_of_earning);
                            //           // Logger.info("total amount without  date is",result.total_amount);
                            //        result.total_amount=response[0].sum;
                            //        Logger.info("response is",response);
                            //
                            //           // Logger.info("date is",userResult.object[0].date_of_earning);
                            //         resultUser.push(result);
                            //
                            //         // Logger.info("result of user ",resultOfUser);
                            //       });
                            //
                            //     })

                            if (skip != 0) {
                                callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                            } else {
                                domain.User_Earning_Bucket.find({ user_id: { $in: userIds } }).count(function(err, count) {
                                    userResult.count = count;

                                    callback(err, SetResponse.setSuccess('user with its earning  with skip is', userResult));
                                })
                            }
                        })
                }
            }]
        })
    }
    AdminUserService.prototype.searchUsersInDeleteRequest = function(email, skip, limit, callback) {

        async.auto({
            findUserInDeleteRequest: function(next, results) {
                domain.DeleteRequests.find({ status: { $in: ['PENDING', 'CANCELLED'] } }, function(err, deleteRequests) {
                    //  Logger.info("vouchers are",vouchers.length);
                    next(err, deleteRequests);
                });
            },
            getUserWithVoucher: ['findUserInDeleteRequest', function(next, results) {

                var userIds = results.findUserInDeleteRequest.map(function(deleteRequestsOfUser) {

                    return deleteRequestsOfUser.user;
                })

                if (parseInt(email)) {
                    domain.User.find({
                        _id: { $in: userIds },

                        $or: [{
                            phonenumber: { $gte: parseInt(email) * Math.pow(10, 12 - email.length), $lte: (parseInt(email) + 1) * Math.pow(10, 12 - email.length) }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }]
                    }, function(err, objects) {
                        //  Logger.info("objects are",objects);
                        var Id = objects.map(function(user) {

                            return user._id;

                        })
                        exexuteQueryInDeleteRequests(Id, skip, limit, callback);

                    })
                } else {

                    domain.User.find({
                        _id: { $in: userIds },
                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }]
                    }, function(err, objects) {
                        //  Logger.info("objects are",objects);
                        var Id = objects.map(function(user) {

                            return user._id;

                        })
                        exexuteQueryInDeleteRequests(Id, skip, limit, callback);

                    })
                }

            }]

        })

    }




    var exexuteQueryInDeleteRequests = function(Id, skip, limit, callback) {
        var userResult = {};
        domain.DeleteRequests.find({
                $and: [{ "user": { $in: Id } },
                    { "status": { $in: ['PENDING', 'CANCELLED'] } },

                ]
            }).skip(skip)
            .limit(limit)
            .populate('user')
            .exec(function(err, response) {
                if (skip != 0) {
                    userResult.object = response;
                    callback(err, SetResponse.setSuccess('user with its voucher  details after search is', userResult));
                } else {
                    domain.DeleteRequests.find({
                        $and: [{ "user": { $in: Id } },
                            { "status": { $in: ['PENDING', 'CANCELLED'] } }
                        ]
                    }).count(function(err, count) {
                        userResult.count = count;
                        userResult.object = response;
                        callback(err, SetResponse.setSuccess('user with its voucher details after search is', userResult));
                    })
                }
            })

    }

    AdminUserService.prototype.searchUsersInPaymentRequest = function(type, email, skip, limit, callback) {

        async.auto({
            findUserInPaymentRequest: function(next, results) {
                domain.UserRequests.find({ request_type: type }, function(err, paymentRequests) {
                    //  Logger.info("vouchers are",vouchers.length);
                    next(err, paymentRequests);
                });
            },
            getUserWithPayment: ['findUserInPaymentRequest', function(next, results) {

                var userIds = results.findUserInPaymentRequest.map(function(paymentRequestsOfUser) {

                    return paymentRequestsOfUser.user;
                })


                if (parseInt(email)) {
                    domain.User.find({
                        _id: { $in: userIds },

                        $or: [{
                            phonenumber: { $gte: parseInt(email) * Math.pow(10, 12 - email.length), $lte: (parseInt(email) + 1) * Math.pow(10, 12 - email.length) }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }]
                    }, function(err, objects) {
                        //  Logger.info("objects are",objects);
                        var Id = objects.map(function(user) {

                            return user._id;

                        })
                        exexuteQueryInPaymentRequests(type, Id, skip, limit, callback);

                    })
                } else {

                    domain.User.find({
                        _id: { $in: userIds },
                        $or: [{
                            name: { $regex: email, $options: 'i' }
                        }, {
                            email: { $regex: email, $options: 'i' }
                        }, {
                            referralId: { $regex: email, $options: 'i' }
                        }]
                    }, function(err, objects) {
                        //  Logger.info("objects are",objects);
                        var Id = objects.map(function(user) {

                            return user._id;

                        })
                        exexuteQueryInPaymentRequests(type, Id, skip, limit, callback);

                    })
                }


            }]

        })

    }




    var exexuteQueryInPaymentRequests = function(type, Id, skip, limit, callback) {
        var userResult = {};
        domain.UserRequests.find({
                $and: [{ "user": { $in: Id } },
                    { request_type: type }

                ]
            }).skip(skip)
            .limit(limit)
            .populate('user')
            .exec(function(err, response) {
                if (skip != 0) {
                    userResult.object = response;
                    callback(err, SetResponse.setSuccess('user with its paymentRequests  details after search is', userResult));
                } else {
                    domain.UserRequests.find({
                        $and: [{ "user": { $in: Id } },
                            { request_type: type }
                        ]
                    }).count(function(err, count) {
                        userResult.count = count;
                        userResult.object = response;
                        callback(err, SetResponse.setSuccess('user with its payment details after search is', userResult));
                    })
                }
            })

    }

    AdminUserService.prototype.searchAdminByDate = function(date, skip, limit, role, callback) {
        // Logger.info("date and role is ",date,role);
        var date1 = new Date(date);
        var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
        // Logger.info("date1 is ",date1);
        var result = {};
        domain.User.find({
                role: role,
                deleted: false,
                created: { $gte: date, $lt: oneDayAfter }
            })
            .skip(skip)
            .limit(limit)
            .exec(function(err, userResult) {
                result.object = userResult;
                if (skip != 0) {
                    callback(err, SetResponse.setSuccess('user searching by date', result));
                } else {
                    domain.User.find({
                        role: role,
                        deleted: false,
                        created: { $gte: date, $lt: oneDayAfter }
                    }).count(function(err, count) {
                        // Logger.info("count is",count);
                        result.count = count;
                        callback(err, SetResponse.setSuccess('user searching by date', result));

                    })
                }
            })


    }
    AdminUserService.prototype.getAllUserServicePanel = function(date, role, limit, skip, callback) {
        //Logger.info(skip, "control in the service layer", limit);
        var object = {};
        var sort = {
            _id: -1
        };
        if (role == "ROLE_ADMIN") {
            var buildQuery = function() {
                return domain.User.find({
                    deleted: false,
                    $or: [{
                        role: "ROLE_ADMIN"
                    }, {
                        role: "ROLE_DELEGATED_ADMIN"
                    }]
                })
            }
            executeQuery(buildQuery(), buildQuery(), skip, limit, sort, callback);
        } else {
            // Logger.info("in else part");
            if (date != 0) {
                var date = new Date(date);
                var isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
                // Logger.info("date after new Date is ",date,isoDate);

                var date1 = new Date(date);
                var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
                var isoDate1 = new Date(oneDayAfter.getTime() - oneDayAfter.getTimezoneOffset() * 60000).toISOString();

                // Logger.info("one day after is ",oneDayAfter,isoDate1);
                var buildQuery = function() {
                    return domain.User.find({
                        $and: [
                            { deleted: false },
                            { role: role },
                            { created: { $gt: isoDate, $lte: isoDate1 } }
                        ]
                    });
                }
            } else {
                // Logger.info("in else withoout date");
                var buildQuery = function() {
                    return domain.User.find({
                        deleted: false,
                        role: role
                    });
                }
            }
            executeQuery(buildQuery(), buildQuery(), skip, limit, sort, callback);

        }

    }

    AdminUserService.prototype.getAllUserService = function(role, limit, skip, callback) {
        //Logger.info(skip, "control in the service layer", limit);
        var object = {};
        var sort = {
            _id: -1
        };
        if (role == "ROLE_ADMIN") {
            var buildQuery = function() {
                return domain.User.find({
                    deleted: false,
                    $or: [{
                        role: "ROLE_ADMIN"
                    }, {
                        role: "ROLE_DELEGATED_ADMIN"
                    }]
                })
            }
            executeQuery(buildQuery(), buildQuery(), skip, limit, sort, callback);
            //
        }
        //  else {
        //           Logger.info("in else part");
        //           if(date !=0){
        //
        //             var date1=new Date(date);
        //            var oneDayAfter = new Date(date1.setDate(date1.getDate() + 1));
        //            Logger.info("date and on day after is",date,oneDayAfter);
        //             var buildQuery = function () {
        //                 return  domain.User.find( { $and: [
        //                               {deleted: false},
        //                               {role:role },
        //                               {created: {$gt:date,$lte:oneDayAfter}}
        //                           ]
        // });
        //               }
        //             }
        else {
            // Logger.info("in else withoout date");
            var buildQuery = function() {
                return domain.User.find({
                    deleted: false,
                    role: role
                });
            }
            executeQuery(buildQuery(), buildQuery(), skip, limit, sort, callback);

        }

    }


}
module.exports = function(app) {
    return new AdminUserService(app);
};
