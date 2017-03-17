 var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Chat_Channel_Schema = new mongooseSchema({
    channel_id:{
        type:String,
        required: false
    },
    to_user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        },
    from_user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publish_topic:{
         type: String,
         required: false,
         trim: true
    },
    subscribe_topic:{
         type: String,
         required: false,
         trim: true
    },
    
    subscribed_user_id:[]
    });

function stringNotNull(obj) {
    return obj.length
}

Chat_Channel_Schema.plugin(softDelete);
Chat_Channel_Schema.plugin(timestamps);

var ChatChannel = mongoose.model('ChatChannel', Chat_Channel_Schema);
module.exports = ChatChannel