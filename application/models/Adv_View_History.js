var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Ad_view_history_Schema = new mongooseSchema({
    ad_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advert'
    },
    ad_type: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    userView: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        location: {
            latitude: {
                type: Number,
                default: '',
                required: false,
                trim: true
            },
            longitude: {
                type: Number,
                default: '',
                required: false,
                trim: true
            }
        },
        age: {
            type: Number,
            default: 0,
            required: false,
            trim: true
        },
        gender: {
            type: String,
            default: '',
            required: false,
            trim: true
        }
    },
    complete_view: {
        type: Boolean,
        required: false,
        default: false
    },
    client_charged_for_view: {
        type: Number,
        required: false,
        default: 0
    },
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
    date: {
        type: Date,
        default: Date.now
    }
});

function stringNotNull(obj) {
    return obj.length
}

Ad_view_history_Schema.plugin(softDelete);
Ad_view_history_Schema.plugin(timestamps);

var Ad_view_history = mongoose.model('Ad_view_history', Ad_view_history_Schema);
module.exports = Ad_view_history