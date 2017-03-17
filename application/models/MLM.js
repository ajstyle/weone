var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var MLM_Schema = new mongooseSchema({
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
    child_node1: {
        type: Number,
        required: true,
        default: 0,
        trim: true
    },
    child_node2: {
        type: Number,
        required: true,
        default: 0,
        trim: true

    }, Date: {
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

MLM_Schema.plugin(softDelete);
MLM_Schema.plugin(timestamps);

var MLM = mongoose.model('MLM', MLM_Schema);
module.exports = MLM
