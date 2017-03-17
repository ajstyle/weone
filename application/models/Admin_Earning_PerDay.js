var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Admin_Earning_Bucket_Schema = new mongooseSchema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin_Earning_Details'
    },
    total_number_of_earnings: {
        type: Number,
        default: 0,
        required: true
    },
    revenue_from_users: [{
        amount: {
            type: Number,
            default: 0,
            required: false,
        },
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
    }],
    date_of_earning: {
        type: Date,
        default: Date.now
    },
    total_amount:{
        type:Number,
        default:0,
        required:false
    }
});

function stringNotNull(obj) {
    return obj.length
}

Admin_Earning_Bucket_Schema.plugin(softDelete);
Admin_Earning_Bucket_Schema.plugin(timestamps);

var Admin_Earning_Bucket = mongoose.model('Admin_Earning_Bucket', Admin_Earning_Bucket_Schema);
module.exports = Admin_Earning_Bucket
