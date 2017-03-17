var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Notification_History_Schema = new mongooseSchema({
    app_platform:{
        type:String,
        default:'',
        required:true
    },
    device_token:{
        type:String,
        default:'',
        required:false
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date:{
        type:Date,
        default:Date.now
    },
    time_stamp:{
        type:Number,
        default:0,
        requred:true
    },
    notification_type:{
        type:String,
        default:''
    },
    notification_message:{
        type:String,
        default:''
    },
    is_send_to_all:{
      type:Boolean,
      default:false
    }

});

function stringNotNull(obj) {
    return obj.length
}

Notification_History_Schema.plugin(softDelete);
Notification_History_Schema.plugin(timestamps);

var Notification_History = mongoose.model('Notification_History', Notification_History_Schema);
module.exports = Notification_History
