module.exports = function() {
    var savePrice = function(req, res, callback) {
        var item = req.params.item;
        this.services.activityPriceService.price(item, callback);
    }
    var getValue = function(req, res, callback) {
        this.services.activityPriceService.getValue(callback);
    }
    return {
        savePrice: savePrice,
        getValue: getValue
    }
};
