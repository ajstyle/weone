var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Ad_click_history_Schema = new mongooseSchema({
    ad_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advert'
    },
    user: {
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
    client_charged_for_click: {
        type: Number,
        required: false,
        default:0
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
    date:{
       type: Date,
		default: Date.now
    }
});

function stringNotNull(obj) {
    return obj.length
}

Ad_click_history_Schema.plugin(softDelete);
Ad_click_history_Schema.plugin(timestamps);

var Ad_click_history = mongoose.model('Ad_click_history', Ad_click_history_Schema);
module.exports = Ad_click_history