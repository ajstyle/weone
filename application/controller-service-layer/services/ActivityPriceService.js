var BaseService = require('./BaseService');
var SetResponse = require('./SetResponseService');
ActivityPriceService = function(app) {
    this.app = app;
}

ActivityPriceService.prototype = new BaseService();

ActivityPriceService.prototype.price = function(items, callback) {
    var item = JSON.parse(items);
    var obj = {
        youtube: {
            videoviews: (item.video != undefined) ? item.video : 0,
            subscribers: (item.subscribers != undefined) ? item.subscribers : 0,
            likes: (item.likes != undefined) ? item.likes : 0,
            dislikes: (item.dislikes != undefined) ? item.dislikes : 0,
            comments: (item.Comments != undefined) ? item.Comments : 0
        },
        facebook: {
            pagefans: (item.fans != undefined) ? item.fans : 0,
            follows: (item.follows != undefined) ? item.follows : 0,
            websitelikes: (item.websiteLikes != undefined) ? item.websiteLikes : 0,
            statuslikes: (item.statusLikes != undefined) ? item.statusLikes : 0,
            shares: (item.shares != undefined) ? item.shares : 0
        },
        website: {
            visit: (item.visit !== undefined) ? item.visit : 0
        }
    };
    var ActivityPrice = new domain.Activity_Price(obj);
    domain.Activity_Price.count(function(err, count) {
        if (count == 0) {
            ActivityPrice.save(function(err, obj) {
                callback(err, SetResponse.setSuccess("Price Updated", obj));
            });
        } else {
            domain.Activity_Price.findOne({}, function(err, item) {
                var id = item._id;
                domain.Activity_Price.update({ _id: id }, { $set: obj }, function(err, obj) {
                    if (err) {
                        callback(err, SetResponse.setError("Not Updated ", null));
                        console.log(err.message);
                    } else {
                        callback(err, SetResponse.setSuccess("Price Updated", obj));
                    }
                });

            });
        }

    })
    console.log(" control inside getting weone Activity");

}

ActivityPriceService.prototype.getValue = function(callback) {
    domain.Activity_Price.findOne({}, function(err, item) {
        if (err) {
            callback(err, SetResponse.setError("Not Updated ", null));
            console.log(err.message);
        } else {
            callback(err, SetResponse.setSuccess("Price Updated", item));
        };
    })
}

module.exports = function(app) {
    return new ActivityPriceService(app);
};
