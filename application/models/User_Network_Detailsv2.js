var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var User_Network_Detailsv2_Schema=new mongooseSchema({
    user_id:{
        type:String,
        required:true,
    },
    node_id:{
        type:Number,
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
        persons:[{
            user_id:{
                type:String,
                default:'',
                required:false
            },name:{
                type:String,
                default:'',
                required:false
            },
            total_balance:{
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
User_Network_Detailsv2_Schema.plugin(softDelete);
User_Network_Detailsv2_Schema.plugin(timestamps);

var User_Network_Detailsv2 = mongoose.model('User_Network_Detailsv2', User_Network_Detailsv2_Schema);
module.exports = User_Network_Detailsv2
