var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');

var SMS_OTP_Schema = new mongooseSchema({
    mobileno: {
        type: String,
        required: true,
        trim: true
    },
    opt_code: {
        type: Number,
        required: true,
        trim: true
    }
});

function stringNotNull(obj) {
    return obj.length
}

SMS_OTP_Schema.plugin(softDelete);
SMS_OTP_Schema.plugin(timestamps);

var SMS_OTP = mongoose.model('SMS_OTP', SMS_OTP_Schema);
module.exports = SMS_OTP