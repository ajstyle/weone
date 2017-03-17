var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');

var App_Version_Details_Schema = new mongooseSchema({
  current_version:{
    type: String,
    default: '0.0',
    required: true,
    trim: true
  },
  platform:{
    type: String,
    default: 'N/A',
    required: true,
    trim: true
  },
  last_version:{
    type: String,
    default: '0.0',
    required: true,
    trim: true
  },
  total_updates:{
    type: Number,
    default: 0,
    trim: true
  },
  deleted:{
    type:Boolean,
    default:false
  },
  message:{
    type:String,
    default:'null',
    required:true
  }
});

App_Version_Details_Schema.plugin(softDelete);
App_Version_Details_Schema.plugin(timestamps);

function stringNotNull(obj){
   return obj.length
}



var App_Version_Details_Schema = mongoose.model('App_Version_Details', App_Version_Details_Schema);
module.exports = App_Version_Details_Schema
