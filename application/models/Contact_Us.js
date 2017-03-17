var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Contact_Us = new mongooseSchema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description:{
      type: String,
      required:true
    },
    image_url:{
      type:String,
      default:""
    }
});

function stringNotNull(obj) {
    return obj.length
}

Contact_Us.plugin(softDelete);
Contact_Us.plugin(timestamps);

var Contact_Us = mongoose.model('Contact_Us', Contact_Us);
module.exports = Contact_Us
