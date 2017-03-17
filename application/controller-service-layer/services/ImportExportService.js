var SetResponse = require('./SetResponseService');
ImportExportService = function (app) {
    this.app = app;
};

var generateExcelSheet = function (headingFields, sheetName, sheetPath, data, dataFields, col, row, next) {
    //Logger.info("Control in the generate excel sheet");
    // Create a new workbook file in current working-path
    var workbook = excelbuilder.createWorkbook(sheetPath, sheetName);
    // Create a new worksheet with columns and rows
    var sheet1 = workbook.createSheet('sheet1', col, row);
    // Fill some data
    for (var i = 0; i < headingFields.length; i++) {
        sheet1.set(i + 1, 1, headingFields[i]);
    }
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < headingFields.length; j++) {
            sheet1.set(j + 1, i + 2, data[i][dataFields[j]]);
        }
    }
    workbook.save(function (ok) {
        workbook.cancel();
        //Logger.info('congratulations, your workbook created');
        next(null, ok);
    });
}

var getBeneficiaryList = function (status,next) {
    //Logger.info("control in the getBeneficiary list");
    domain.User.find({
        role: 'ROLE_USER',
        deleted: false,
        user_account_details_id: {
            $exists: true
        },
        user_beneficiary_add_status: status
    }, {
        user_account_details_id: 1
    }).populate("user_account_details_id").exec(function (err, userObject) {
        //Logger.info("total number of beneficiary exist", userObject.length);
        next(err, userObject);
    });
}

var saveExcelSheetHistory = function (excelSheetObject, next) {
    //Logger.info("control in the saveExcelSheetOfBeneficary");
    var excelSheetHistoryObject = new domain.Excel_History(excelSheetObject);
    excelSheetHistoryObject.save(function (err, saveExcelHistoryObject) {
        next(err, saveExcelHistoryObject);
    });
}

var generateExcelSheetObject = function (excel_action_type, name_excel_file, action_type) {
    return {
        excel_action_type: excel_action_type,
        name_excel_file: name_excel_file,
        action_type: action_type
    };
}

ImportExportService.prototype.getBeneficiaryDetials = function (callback) {
    var headingFields = ['USER_ID', 'PARTY_NAME', 'ACC_NO', 'IFSC', 'BR_CODE', 'ADDRESS', 'MOBILE_NO', 'EMAIL_ID', 'PAN_NO', 'BENEFICIARY_STATUS'];
    var sheetPath = configurationHolder.config.excelFilePath;
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_exportBeneficiary.xlsx";
    var dataFields = ['user', 'party_name', 'acc_no', 'ifsc_code', 'branch_code', 'address', 'mobile_no', 'email_id', 'pan_card_no'];
    async.auto({
        getTheBeneficiary: function (next, result) {
            return getBeneficiaryList("no",next)
        },
        generateExcelFile: ['getTheBeneficiary', function (next, result) {
            var data = [];
            for (var i = 0; i < result.getTheBeneficiary.length; i++) {
                data.push(result.getTheBeneficiary[i].user_account_details_id);
            }
            return generateExcelSheet(headingFields, sheetName, sheetPath, data, dataFields, 11, 12, next)
        }],
        saveTheExcelSheet: function (next, result) {
            var excelSheetHistoryObject = generateExcelSheetObject('export', sheetName, 'beneficiary');
            return saveExcelSheetHistory(excelSheetHistoryObject, next)
        }
    }, function (err, result) {
        //Logger.info("Export of beneficiary created successfully");
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.beneficiaryExport, configurationHolder.config.excelFileLink + sheetName));
    });
}

ImportExportService.prototype.getExcelHistory = function (action, limit, skip, callback) {
    //Logger.info("control in the getExcelHistory", action, limit, skip)
    var object={};
    domain.Excel_History.aggregate([{
            $match: {
                action_type: action
            }
        }, {
            $sort: {
                excel_action_date: -1
            }
        }, {
            $skip: skip
    }, {
            $limit: limit
    }
    ], function (err, excelHistoryObject) {
        object.object=generateExcelFilePath(excelHistoryObject);
       if (skip == 0) {
            domain.Excel_History.aggregate([{
                $match: {
                    action_type: action
                }
        }],function (err, excelHistoryCount) {
                //Logger.info("Excel history count",excelHistoryCount.length)
                object.count=excelHistoryCount.length;
                callback(err, SetResponse.setSuccess("History list", object));
            })
        } else {
            callback(err, SetResponse.setSuccess("History list",object));
        }
    })
}

var generateExcelFilePath = function (excelHistoryObjectArray) {
    var execlHistoryObject = [];
    for (var i = 0; i < excelHistoryObjectArray.length; i++) {
        execlHistoryObject.push({
            excel_action_date: excelHistoryObjectArray[i].excel_action_date,
            excel_action_type: excelHistoryObjectArray[i].excel_action_type,
            name_excel_file: excelHistoryObjectArray[i].name_excel_file,
            link_of_excel_file: configurationHolder.config.excelFileLink + "" + excelHistoryObjectArray[i].name_excel_file
        })
    }
    return execlHistoryObject;
}

var readExcelFile = function (excelFilePath, callback) {
    //Logger.info("control in the readExcel file", excelFilePath)
    var workbook = XLSX.readFile(excelFilePath);
    var dataObject = XLSX.utils.sheet_to_json(workbook.Sheets[Object.keys(workbook.Sheets)]);
    callback(null, dataObject);
}

var createExcelFile = function (filePath, excelFilePath, callback) {
    file.rename(
        filePath, excelFilePath,
        function (err) {
            if (err) {
                callback(new Error("Something Went Wrong"))
            } else {
                //Logger.info('excel write successfully');
                file.chmod(excelFilePath, 0777)
            }
            callback(err, excelFilePath)
        });
}

var changeTheStatusOfBeneficiary = function (objectIds, status, callback) {
    //Logger.info("control in the change status beneficary", objectIds.length)
    domain.User.update({
            _id: {
                $in: objectIds
            }
        }, {
            $set: {
                user_beneficiary_add_status: status
            }
        }, {
            multi: true
        },
        function (err, addedBeneficiaryObjects) {
            callback(err, addedBeneficiaryObjects);
        });
}

ImportExportService.prototype.importBeneficaryExcelHistory = function (file, callback) {
    //Logger.info("Control in the import beneficary excel history");
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_importBeneficiary.xlsx";
    async.auto({
        createExcelFileForImportBeneficiary: function (next, result) {
            return createExcelFile(file.path, configurationHolder.config.excelFilePath + "/" + sheetName, next)
        },
        "readBeneficiaryExcelFile": ["createExcelFileForImportBeneficiary", function (next, result) {
            return readExcelFile(result.createExcelFileForImportBeneficiary, next)
        }]
    }, function (err, result) {
        var excelReadDateObjects = result.readBeneficiaryExcelFile;
        var errBeneficiaryObjects = []
        var successfullyAddedBeneficiaryObjects = [];
        for (var i = 0; i < excelReadDateObjects.length; i++) {
            if (excelReadDateObjects[i].BENEFICIARY_STATUS) {
                if ((excelReadDateObjects[i].BENEFICIARY_STATUS).toLowerCase() == 'yes')
                    successfullyAddedBeneficiaryObjects.push(excelReadDateObjects[i].USER_ID);
                else if ((excelReadDateObjects[i].BENEFICIARY_STATUS).toLowerCase() == 'error') {
                    errBeneficiaryObjects.push(excelReadDateObjects[i].USER_ID);
                }
            }
        }
        async.parallel({
            successAddedBeneficiary: changeTheStatusOfBeneficiary.bind(null, successfullyAddedBeneficiaryObjects, 'yes'),
            errorBeneficiary: changeTheStatusOfBeneficiary.bind(null, errBeneficiaryObjects, 'error'),
            saveExcelSheetHistoryAfterChangeBeneficiaryStatus: saveExcelSheetHistory.bind(null, generateExcelSheetObject('import', sheetName, 'beneficiary'))
        }, function (err, result) {
            callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.beneficiaryListAddSuccess, result));
        });
   });
}

var getTheTransactionDetailsOfUsers = function (next) {
    //Logger.info("Control in the getTheTransactionDetailsOfUsers");
    domain.User.find({
        role: "ROLE_USER",
        deleted: false,
        user_account_details_id: {
            $exists: true
        },
        user_beneficiary_add_status: 'yes',
        isAccountActive: true
    }, {
        user_account_details_id: 1,
        user_beneficiary_add_status: 1,
        user_account: 1
    }).populate("user_account_details_id").exec(function (err, userObjects) {
        //Logger.info("total number of users for transaction", userObjects.length)
        next(err, userObjects)
    });
}

ImportExportService.prototype.getTransactionDetails = function (callback) {
    //Logger.info("control in the get transaction details");
    var headingFields = ['USER_ID', 'ACCOUNT_NO', 'BRANCH_CODE', 'IFSC_CODE', 'DATE_OF_TRANS', 'DR_AMOUNT', 'CR_AMOUNT', 'UNIQUE_REF_NO', 'PARTY_NAME', 'DESCREPTION', 'TRANSCACTION_STATUS'];
    var sheetPath = configurationHolder.config.excelFilePath;
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_exportTransaction.xlsx";
    var dataFields = ['user', 'acc_no', 'branch_code', 'ifsc_code', 'date_of_trans', 'dr_amount', 'cr_amount', 'unqiue_ref_no', 'party_name'];
    async.auto({
        getTheTransactionUsers: function (next, result) {
            return getTheTransactionDetailsOfUsers(next)
        },
        generateExcelFile: ['getTheTransactionUsers', function (next, result) {
            var data = [];
            for (var i = 0; i < result.getTheTransactionUsers.length; i++) {
                var object = result.getTheTransactionUsers[i].user_account_details_id;
                object.cr_amount = result.getTheTransactionUsers[i].user_account.wallet.wallet_amount_available;
                object.unqiue_ref_no = "NEFT" + new Date().getTime() + Math.floor(Math.random() * 10000);
                data.push(object);
            }
            return generateExcelSheet(headingFields, sheetName, sheetPath, data, dataFields, 11, 12, next)
        }],
        saveTheExcelSheet: function (next, result) {
            var excelSheetHistoryObject = generateExcelSheetObject('export', sheetName, 'transaction');
            return saveExcelSheetHistory(excelSheetHistoryObject, next)
        }
    }, function (err, result) {
        //Logger.info("Export of transaction created successfully");
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.transactionExport, configurationHolder.config.excelFileLink + sheetName));
    });
}

ImportExportService.prototype.importTransactionExcelHistory = function (file, callback) {
    //Logger.info("control in the importTransactionExcelHistory");
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_importTransaction.xlsx";
    async.auto({
        createExcelFileForImportTransaction: function (next, result) {
            return createExcelFile(file.path, configurationHolder.config.excelFilePath + "/" + sheetName, next)
        },
        "readTransactionExcelFile": ["createExcelFileForImportTransaction", function (next, result) {
            return readExcelFile(result.createExcelFileForImportTransaction, next)
        }],
         saveTheExcelSheet: function (next, result) {
            var excelSheetHistoryObject = generateExcelSheetObject('import', sheetName, 'transaction');
            return saveExcelSheetHistory(excelSheetHistoryObject, next)
        }
    }, function (err, result) {
        var excelReadDateObjects = result.readTransactionExcelFile;
        var successfullyTransactionObjects = [];
        for (var i = 0; i < excelReadDateObjects.length; i++) {
            if (excelReadDateObjects[i].TRANSCACTION_STATUS) {
                if ((excelReadDateObjects[i].TRANSCACTION_STATUS).toLowerCase() == 'yes')
                    successfullyTransactionObjects.push(excelReadDateObjects[i]);
            }
        }
        var maintainUserWallet = sync(changeTheAmountInWallet);
        sync.fiber(function () {
            for (var i = 0; i < successfullyTransactionObjects.length; i++) {
                maintainUserWallet(successfullyTransactionObjects[i]);
            }
        });
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.transactionImport, result));
    });
}

var changeTheAmountInWallet = function (transactionObject, callback) {
    domain.User.findOneAndUpdate({
            _id: transactionObject.USER_ID
        }, {
            $inc: {
                "user_account.wallet.amount_to_credit_till_date": transactionObject.DR_AMOUNT,
                "user_account.wallet.wallet_amount_available": -transactionObject.DR_AMOUNT
            }
        }, {
            new: true
        },
        function (err, userObject) {
            if (userObject) {
                changeInTheAmountOfNeo4j(userObject.neo4J_node_id,transactionObject, callback)
            } else {
                callback(err, "error in wallet ammount")
            }
        });
}

var changeInTheAmountOfNeo4j = function (node_id,transactionObject,callback) {
    neo4jDbConnection.cypherQuery("match(n:user) where id(n)={node_id} set n.balance=n.balance+{amount}  RETURN n", {
        node_id: node_id,
        amount: -parseInt(transactionObject.DR_AMOUNT)
    }, function (err, neo4j_obj) {
        if(err){
            //Logger.error("Error in the amount update in the neo4j");
        }else{
            //Logger.info("Transaction amount of neo4j is changed");
        }
       maintainTheTransaction(transactionObject, callback)
    });
}

var maintainTheTransaction = function (transactionObject, callback) {
    var transactionBucketLength = 1000;
    domain.Account_Transaction_Bucket.findOne({
        user_id: transactionObject.USER_ID,
        credit_transactions_count: {
            $lt: transactionBucketLength
        }
    }, function (err, transactionBucketObject) {
        if (transactionBucketObject) {
            //push into existing bucket
            pushTheObjectInExistingBucket(transactionObject, transactionBucketObject._id, callback);
        } else {
            //create new bucket
            createNewBucket(transactionObject, callback)
        }
    });
}

var pushTheObjectInExistingBucket = function (transactionObject, accountTransId, callback) {
    //Logger.info("Control in the existing bucket history");
    domain.Account_Transaction_Bucket.findOneAndUpdate({
        _id: accountTransId
    }, {
        $push: {
            credit_transactions_history: createTransactionBucketObject(transactionObject)
        },
        $inc:{
            credit_transactions_count:1
        },
    }, function (err, transactionObject) {
        if (transactionObject) {
            //Logger.info("Tranasaction object history is push in bucket successfully");
        } else {
            //Logger.info("Error in the push the transaction history in bucket");
        }
        callback(err, transactionObject)
    });
}

var createNewBucket = function (transactionObject, callback) {
    var transactionHistoryBucket = new domain.Account_Transaction_Bucket({
        user_id: transactionObject.USER_ID,
        credit_transactions_count: 1,
        credit_transactions_history: createTransactionBucketObject(transactionObject)
    });
    transactionHistoryBucket.save(function (err, saveTransactionObject) {
        if (!err && saveTransactionObject) {
            //Logger.info("new transaction history bucket created successfully");
            linkTheTransactionBucketWithUser(transactionObject.USER_ID, saveTransactionObject._id, callback)
        } else {
            //Logger.info("error in create the transaction bucket");
            callback(err, null)
        }
    });
}

var linkTheTransactionBucketWithUser = function (user_id, transactionBucketId, callback) {
    domain.User.findOneAndUpdate({
        _id: user_id
    }, {
        "user_account.wallet.account_transaction_current_bucket": transactionBucketId,
        $push: {
            "user_account.wallet.account_transaction_bucket": transactionBucketId
        }
    }, {
        new: true
    }, function (err, userObject) {
        callback(err, userObject)
    });
}

var createTransactionBucketObject = function (transactionObject) {
    return {
        amount_credit: transactionObject.DR_AMOUNT,
        account_no: transactionObject.ACCOUNT_NO,
        ifsc_code: transactionObject.IFSC_CODE,
        description: transactionObject.DESCREPTION,
        party_name: transactionObject.PARTY_NAME,
        unique_ref_code: transactionObject.UNIQUE_REF_NO,
        date_of_transaction_from_excel: transactionObject.DATE_OF_TRANS
    }
}

ImportExportService.prototype.getErrorListOfBeneficiary=function(callback){
    //Logger.info("Control in the get error beneficiary list service");
     var headingFields = ['USER_ID', 'PARTY_NAME', 'ACC_NO', 'IFSC', 'BR_CODE', 'ADDRESS', 'MOBILE_NO', 'EMAIL_ID', 'PAN_NO', 'BENEFICIARY_STATUS'];
    var sheetPath = configurationHolder.config.excelFilePath;
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_exportErrorBeneficiary.xlsx";
    var dataFields = ['user', 'party_name', 'acc_no', 'ifsc_code', 'branch_code', 'address', 'mobile_no', 'email_id', 'pan_card_no'];
    async.auto({
        getTheBeneficiary: function (next, result) {
            return getBeneficiaryList("error",next)
        },
        generateExcelFile: ['getTheBeneficiary', function (next, result) {
            var data = [];
            for (var i = 0; i < result.getTheBeneficiary.length; i++) {
                data.push(result.getTheBeneficiary[i].user_account_details_id);
            }
            return generateExcelSheet(headingFields, sheetName, sheetPath, data, dataFields, 11, 12, next)
        }],
        saveTheExcelSheet: function (next, result) {
            var excelSheetHistoryObject = generateExcelSheetObject('export', sheetName, 'beneficiary');
            return saveExcelSheetHistory(excelSheetHistoryObject, next)
        }
    }, function (err, result) {
        //Logger.info("Export of beneficiary created successfully");
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.beneficiaryExport, configurationHolder.config.excelFileLink + sheetName));
    });
}

ImportExportService.prototype.getVoucherDetails = function (data, callback) {
    // Logger.info("the data is",data);

    var headingFields = ['START_DATE', 'END_DATE', 'VOUCHER_ID', 'AMOUNT', 'NAME', 'MOBILE', 'ACCOUNT', 'IFSC_CODE', 'BRANCH_CODE', 'ADDRESS', 'EMAIL_ID', 'PAN_CARD_NO', 'CITY', 'PINCODE', 'STATUS','NEFT'];
    var sheetPath = configurationHolder.config.excelFilePath;
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_exportVoucher.xlsx";
    var dataFields = ['start_date','end_date','voucherId','amount','name','phonenumber','accountNo','ifsc_code','branch_code','address','email_id','pan_card_no','city','pin_code','status','neft'];

    async.auto({
        getTheVoucherDetails: function (next, result) {
            return getTheVoucherDetailsOfUsers(data, next);
        },
        generateExcelFile: ['getTheVoucherDetails', function (next, result) {
          // Logger.info("the results are",result);
            var data = result.getTheVoucherDetails;
            if(result.getTheVoucherDetails){
              return generateExcelSheet(headingFields, sheetName, sheetPath, data, dataFields, headingFields.length+1, result.getTheVoucherDetails.length+1, next)
            }else {
              callback(null, SetResponse.setSuccess("No Vouchers are left any more.",null));
            }
        }],
        saveTheExcelSheet: function (next, result) {
            var excelSheetHistoryObject = generateExcelSheetObject('export', sheetName, 'voucher');
            return saveExcelSheetHistory(excelSheetHistoryObject, next)
        }
    }, function (err, result) {
        //Logger.info("Export of transaction created successfully");
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.transactionExport, configurationHolder.config.excelFileLink + sheetName));
    });
}

var getTheVoucherDetailsOfUsers = function (data, next) {
    // Logger.info("inside voucherdetails of the users",data);
    var start_date = new Date(data.startDate);
    var end_date = new Date(data.endDate);
    domain.Voucher.find({
      amount:{$ne:0},
      created:{$gte:start_date,$lte:end_date},
      status:'PENDING'
    },function(err,vouchers){
      if(!err && vouchers.length>0){
        var userIds = vouchers.map(function(voucher){
          return voucher.user_id;
        })
        // Logger.info("the response is",err,vouchers,userIds);

        domain.User_Account_Details.find(
          {
            user:{$in:userIds}
          },
          function(err,accountDetails){
            // Logger.info("the accounts are",err,accountDetails[0].user);
            if(!err){
              var resObj = [];
              async.forEach(vouchers, function(voucher, next1){
                async.forEach(accountDetails,function(account, next2){
                  if(JSON.stringify(voucher.user_id) == JSON.stringify(account.user)){
                    // Logger.info("There is a match");
                    var obj = {};

//                    obj.user_id = JSON.stringify(account.user);
                    obj.start_date = voucher.startDate;
                    obj.end_date = voucher.endDate;
                    obj.voucherId = voucher.voucherId;
                    obj.amount = voucher.amount;
                    obj.name = account.party_name;
                    obj.phonenumber = account.mobile_no;
                    obj.accountNo = account.acc_no;
                    obj.ifsc_code = account.ifsc_code;
                    obj.branch_code = account.branch_code;
                    obj.address = account.address;
                    obj.mobile_no = account.mobile_no;
                    obj.email_id = account.email_id;
                    obj.pan_card_no = account.pan_card_no;
                    if(account.city){
                      obj.city = account.city;
                    }else {
                      obj.city = 'N/A';
                    }
                    if(obj.pin_code){
                      obj.pin_code = account.pin_code;
                    }else {
                      obj.pin_code = 'N/A';
                    }
                    obj.status = voucher.status;
                    obj.neft = '';

                    resObj.push(obj);
                    next2();
                  }else {
                    next2();
                  }
                },function(err1){
                   next1();
                })
              },function(err2){
                  next(err2, resObj)
              })
            }else {
              next(err);
            }
        })
      }else {
        if(err){
          next(err);
        }else {
          next(null)
        }
      }
    })
}

ImportExportService.prototype.importVoucherExcelHistory = function (file, callback) {
    //Logger.info("control in the importTransactionExcelHistory");
    var sheetName = new Date().getTime() + Math.floor(Math.random() * 10000) + "_importVoucher.xlsx";
    async.auto({
        createExcelFileForImportVoucher: function (next, result) {
            return createExcelFile(file.path, configurationHolder.config.excelFilePath + "/" + sheetName, next)
        },
        readVoucherExcelFile: ["createExcelFileForImportVoucher", function (next, result) {
            return readExcelFile(result.createExcelFileForImportVoucher, next)
        }],
         saveTheExcelSheet: function (next, result) {
            var excelSheetHistoryObject = generateExcelSheetObject('import', sheetName, 'voucher');
            return saveExcelSheetHistory(excelSheetHistoryObject, next)
        }
    }, function (err, result) {
        var excelReadDataObjects = result.readVoucherExcelFile;
        var successfullyVoucherObjects = [];
        // Logger.info("the excel file is",result);

        excelReadDataObjects.forEach(function(data){
          // Logger.info("data is",data);
          if(data.STATUS && data.NEFT){
            domain.Voucher.update({voucherId:data.VOUCHER_ID},{$set:{status:data.STATUS, neft:data.NEFT}},function(err,update){
              if(!err){
                // Logger.info("Updated successfully")
              }else {
                // Logger.info("Some error")
              }

            })
          }
        })
        callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.transactionImport, result));
    });
}


module.exports = function (app) {
    return new ImportExportService(app);
};
