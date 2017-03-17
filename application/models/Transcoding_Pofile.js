var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');

var Transcodingpofile_Schema = new mongooseSchema({
    advertisment_entry_id: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    flavour_id: {
        ref: 'Transcoding_Flavour',
        type: mongoose.Schema.Types.ObjectId
    },
    transcoding_flavour_name: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    transcoding_flavour_id: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    meta_data: {
        name: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        width: {
            type: Number,
            default: '',
            required: false,
            trim: true
        },
        height: {
            type: Number,
            default: '',
            required: false,
            trim: true
        },
        video_bitrate: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        audio_bitrate: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        audio_codec: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        video_codec: {
            type: String,
            default: '',
            required: false,
            trim: true
        }
    },
    transcoding_status: {
        type: String,
        default: 'trancoding',
        required: false,
        trim: true
    }
});

function stringNotNull(obj) {
    return obj.length
}

Transcodingpofile_Schema.plugin(softDelete);
Transcodingpofile_Schema.plugin(timestamps);

var Transcodingpofile = mongoose.model('Transcodingpofile', Transcodingpofile_Schema);
module.exports = Transcodingpofile