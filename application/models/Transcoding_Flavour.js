var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');

var Transcoding_Flavour_Schema = new mongooseSchema({
    name:{
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
});

function stringNotNull(obj) {
    return obj.length
}

Transcoding_Flavour_Schema.plugin(softDelete);
Transcoding_Flavour_Schema.plugin(timestamps);

var Transcoding_Flavour = mongoose.model('Transcoding_Flavour', Transcoding_Flavour_Schema);
module.exports = Transcoding_Flavour