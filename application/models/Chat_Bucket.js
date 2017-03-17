var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var chat_bucket_Schema = new mongooseSchema({
    bucket_count: {
        type: Number,
        default:0,
        required:false
    },
    chat_history_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chathistory'
    },
    messages: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            message: {
                type: String,
                trim:true
            },
            messageType: {
                type: String,
                required:false,
                default:'',
                trim:true
            },
            timeStamp:{
                type: String,
                required:false,
                default:'',
                trim:true
            },
            thumbnailUrl:{
                 type: String,
                trim:true
            },
            fileUrl:{
                 type: String,
                trim:true
            }
        }
    ]
});

function stringNotNull(obj) {
    return obj.length
}

chat_bucket_Schema.plugin(softDelete);
chat_bucket_Schema.plugin(timestamps);

var chatbucket = mongoose.model('chatbucket', chat_bucket_Schema);
module.exports = chatbucket
