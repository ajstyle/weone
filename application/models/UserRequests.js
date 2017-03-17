var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var UserRequests = new mongooseSchema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    request_type: {
        type:String,
        trim: true,
        enum:['PAYMENT']
    },
    status: {
		    type: String,
        enum: ['PENDING', 'COMPLETED','CANCELLED']
	  }
});

function stringNotNull(obj) {
    return obj.length
}

UserRequests.plugin(softDelete);
UserRequests.plugin(timestamps);

var UserRequests = mongoose.model('UserRequests', UserRequests);
module.exports = UserRequests
