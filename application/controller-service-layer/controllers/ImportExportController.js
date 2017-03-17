module.exports = function () {

    var getBeneficiaryDetails = function (req, res, callback) {
        //Logger.info("control in the getBeneficiary details");
        this.services.importExportService.getBeneficiaryDetials(callback);
    }

    var getExcelHistoryList = function (req, res, callback) {
        //Logger.info("control in the getExcel history list");
        this.services.importExportService.getExcelHistory(req.params.action, parseInt(req.params.limit), parseInt(req.params.skip), callback);
    }

    var importBeneficiaryDetails = function (req, res, callback) {
        //Logger.info("Contorl in the import beneficiary details");
        this.services.importExportService.importBeneficaryExcelHistory(req.files.file, callback);
    }

    var exportTransactionDetails = function (req, res, callback) {
        //Logger.info("Control in the export transaction details");
        this.services.importExportService.getTransactionDetails(callback);
    }

    var importTransactionDetails = function (req, res, callback) {
        //Logger.info("Control in the import transaction details");
        this.services.importExportService.importTransactionExcelHistory(req.files.file, callback);
    }

    var getErrorBeneficiaryList=function(req,res,callback){
        //Logger.info("Control in the get ErrorBeneficiary list");
        this.services.importExportService.getErrorListOfBeneficiary(callback);
    }

    var exportVoucherDetails = function(req, res, callback){
      this.services.importExportService.getVoucherDetails(req.body, callback);
    }

    var importVoucherDetails = function (req, res, callback) {
        //Logger.info("Control in the import transaction details");
        // Logger.info("the request is",req.files);
        this.services.importExportService.importVoucherExcelHistory(req.files.file, callback);
    }

    return {
        getBeneficiaryDetails: getBeneficiaryDetails,
        getExcelHistoryList: getExcelHistoryList,
        importBeneficiaryDetails: importBeneficiaryDetails,
        exportTransactionDetails: exportTransactionDetails,
        importTransactionDetails: importTransactionDetails,
        getErrorBeneficiaryList:getErrorBeneficiaryList,
        exportVoucherDetails:exportVoucherDetails,
        importVoucherDetails:importVoucherDetails
    }

}
