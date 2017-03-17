var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Admin_account_detail_Schema = new mongooseSchema({
    total_balance: {
        type: Number,
        default:0,
        required:true
    },
    admin_commission:{
      type:Number,
      default:20
    },
    earning_details: [{
        date: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            default: 0,
            required: false,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
});

function stringNotNull(obj) {
    return obj.length
}

Admin_account_detail_Schema.plugin(softDelete);
Admin_account_detail_Schema.plugin(timestamps);

var Admin_account_detail = mongoose.model('Admin_account_detail', Admin_account_detail_Schema);
module.exports = Admin_account_detail