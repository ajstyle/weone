var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var User_Network_details_Schema=new mongooseSchema({
    user_id:{
        type:String,
        required:true,
    },
    neo4j_node_id:{
        type:String,
        required:true,
    },
    number_of_levels:{
        type:Number,
        default:0
    },
    levels:[{
        level_name:{
            type:String,
            default:'',
            required:false,
            trim:true
        },
        person_count:{
            type:Number,
            default:0,
            required:false,
        },
        person_object_id:[{
            object_id:{
                type:String,
                default:'',
                required:false
            },name:{
                type:String,
                default:'',
                required:false
            },
            balance:{
                type:Number,
                default:0,
                required:false
            },
            phonenumber:{
                type:Number,
                default:0,
                required:false
            }
        }]
    }],
    created: {
		type: Date,
		default: Date.now
	}
});
User_Network_details_Schema.plugin(softDelete);
User_Network_details_Schema.plugin(timestamps);

var User_Network_details = mongoose.model('User_Network_details', User_Network_details_Schema);
module.exports = User_Network_details
