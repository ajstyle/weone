var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Admin_Earning_Details_Schema = new mongooseSchema({
    total_amount:{
        type:Number,
        default:0,
        required:false
    },
    buckets:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin_Earning_Bucket'
    }],
    bucket_count:{
      type:Number,
      default:0,
      required:true
    }
});

function stringNotNull(obj) {
    return obj.length
}

Admin_Earning_Details_Schema.plugin(softDelete);
Admin_Earning_Details_Schema.plugin(timestamps);

var Admin_Earning_Details = mongoose.model('Admin_Earning_Details', Admin_Earning_Details_Schema);
module.exports = Admin_Earning_Details
