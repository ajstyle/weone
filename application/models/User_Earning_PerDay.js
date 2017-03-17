var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var User_earning_bucket_Schema = new mongooseSchema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    total_number_of_earning: {
        type: Number,
        default: 0,
        required: true
    },
    earning_details: [{
        amount: {
            type: Number,
            default: 0,
            required: false,
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
    },
     todays_wallet_amount:{
        type:Number,
        default:0,
        required:false
     }
});

function stringNotNull(obj) {
    return obj.length
}

User_earning_bucket_Schema.plugin(softDelete);
User_earning_bucket_Schema.plugin(timestamps);

var Userearningbucket = mongoose.model('Userearningbucket', User_earning_bucket_Schema);
module.exports = Userearningbucket
