var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var autopopulate = require('mongoose-autopopulate');

var Comment_History_Schema = new mongooseSchema({
    ad_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advert'
    },
    current_bucket_count: {
        type: Number,
        defalut: 0,
        requred: false
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                autopopulate:{select:'name image_url'}
            },
            comment: {
                type: String,
                trim: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            isDeleted:{
              type:Boolean,
              default:false
            }

        }
    ]
});

function stringNotNull(obj) {
    return obj.length
}

Comment_History_Schema.plugin(softDelete);
Comment_History_Schema.plugin(timestamps);
Comment_History_Schema.plugin(autopopulate);

var Comment_History = mongoose.model('Comment_History', Comment_History_Schema);
module.exports = Comment_History
