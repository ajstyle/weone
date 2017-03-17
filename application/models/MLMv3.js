var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var MLMv3_Schema = new mongooseSchema({
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    child_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique : true
    },
    child_count:{
      type:Number,
      required:true,
      default:0
    }
});

function stringNotNull(obj) {
    return obj.length
}

MLMv3_Schema.plugin(softDelete);
MLMv3_Schema.plugin(timestamps);

var MLMv3 = mongoose.model('MLMv3', MLMv3_Schema);
module.exports = MLMv3
