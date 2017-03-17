
var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Chat_history_Schema = new mongooseSchema({
    chat_type:{
        type:String,
        required:false,
        default:'ONE_TO_ONE',
    },
    user_details:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }
    ],
    chat_bucket:[{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'chatbucket'
    }],
    current_chat_bucket:{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'chatbucket'
    },
    topic_ids:[{
    type:String,
    default:'',
    required:false
    }]
    });
function stringNotNull(obj) {
    return obj.length
}

Chat_history_Schema.plugin(softDelete);
Chat_history_Schema.plugin(timestamps);

var Chathistory = mongoose.model('Chathistory', Chat_history_Schema);
module.exports = Chathistory