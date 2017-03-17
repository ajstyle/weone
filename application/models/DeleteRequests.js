var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var DeleteRequests = new mongooseSchema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
		    type: String,
        enum: ['PENDING', 'DELETED','CANCELLED']
	  },
    otp:{
      type:Number
    }
});

function stringNotNull(obj) {
    return obj.length
}

DeleteRequests.plugin(softDelete);
DeleteRequests.plugin(timestamps);

var DeleteRequests = mongoose.model('DeleteRequests', DeleteRequests);
module.exports = DeleteRequests
