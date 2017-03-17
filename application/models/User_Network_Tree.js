var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var User_Network_Tree_Schema=new mongooseSchema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique : true
    },
    number_of_levels:{
        type:Number,
        default:0
    },
    parent_levels:[{
        level_name:{
            type:String,
            default:'',
            required:false,
            trim:true
        },user_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },name:{
            type:String,
            default:'',
            required:false
        },phonenumber:{
            type:Number,
            default:0,
            required:false
        }
    }],
    child_levels_count:[{
        level_name:{
          type:String,
          default:0,
          required:false,
          trim:true
        },
        children_count:{
          type:Number,
          default:0,
          required:false
        }
      }
    ],
    created: {
		type: Date,
		default: Date.now
	}
});
User_Network_Tree_Schema.plugin(softDelete);
User_Network_Tree_Schema.plugin(timestamps);

var User_Network_Tree = mongoose.model('User_Network_Tree', User_Network_Tree_Schema);
module.exports = User_Network_Tree
