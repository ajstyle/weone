var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Like_History_Schema = new mongooseSchema({
     ad_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advert'
    },
     like_by_users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});
function stringNotNull(obj) {
    return obj.length
}

Like_History_Schema.plugin(softDelete);
Like_History_Schema.plugin(timestamps);

var Like_History = mongoose.model('Like_History', Like_History_Schema);
module.exports = Like_History