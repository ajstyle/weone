var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var User_Device_Details_Schema = new mongooseSchema({
    user_id: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
    },
    device_info:{
      brand:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      device:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      model:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      build_id:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      product:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      sdk:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      release:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      incremental:{
        type: String,
        default: '',
        required: false,
        trim: true
      },
      general_info:{
        type: String,
        default: '',
        required: false,
        trim: true
      }
    }
  });

 User_Device_Details_Schema.plugin(timestamps);
 User_Device_Details_Schema.plugin(softDelete);

 var User_Device_Details = mongoose.model('User_Device_Details', User_Device_Details_Schema);
 module.exports = User_Device_Details;
