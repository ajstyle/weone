var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var ClientChargePerDaySchema = new mongooseSchema({
    client_details: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            default: '',
            required: false,
            trim: true
        }
    },
    ad_details: {
        ad_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Advert'
        },
        total_number_complete_view: {
            type: Number,
            default: 0,
            requried: false
        },
        total_number_click: {
            type: Number,
            default: 0,
            requried: false
        }
    },
    click_users:[{
       type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    view_users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    total_client_charge: {
        type: Number,
        default: 0,
        requried: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

function stringNotNull(obj) {
    return obj.length
}

ClientChargePerDaySchema.plugin(softDelete);
ClientChargePerDaySchema.plugin(timestamps);

var ClientChargePerDay = mongoose.model('ClientChargePerDay', ClientChargePerDaySchema);
module.exports = ClientChargePerDay