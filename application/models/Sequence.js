var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var SequenceSchema = new mongooseSchema({
    sequenceId: {
        type: Number,
        default:0,
        required: false,
        trim: true
    }
});
SequenceSchema.plugin(softDelete);
SequenceSchema.plugin(timestamps);

var sequence = mongoose.model('sequence', SequenceSchema);
module.exports = sequence
