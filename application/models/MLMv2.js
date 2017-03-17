var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var MLMv2_Schema = new mongooseSchema({
    node_id: {
        type: Number,
        required: true,
        trim: true
    },
    parent_node: {
        type: Number,
        default: 0,
        trim: true
    },
    child_nodes: [{
        type: Number,
        default: 0,
        trim: true
    }],
    Date: {
        type: Date,
        required: true,
        default: Date.now

    } ,
    user_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

function stringNotNull(obj) {
    return obj.length
}

MLMv2_Schema.plugin(softDelete);
MLMv2_Schema.plugin(timestamps);

var MLMv2 = mongoose.model('MLMv2', MLMv2_Schema);
module.exports = MLMv2
