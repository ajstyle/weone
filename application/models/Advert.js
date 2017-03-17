var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var autopopulate = require('mongoose-autopopulate');
var Advert_Schema = new mongooseSchema({
    name_of_advert: {
        type: String,
        required: true,
        trim: true
    },
    advert_sub_title: {
        type: String,
        required: true,
        trim: true
    },
    advert_url: {
        type: String,
        trim: true,
        required: false
    },
    fileInformation: {
        entry_id: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        fileName: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        extensions_name: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        file_size: {
            type: String,
            default: '',
            required: false,
            trim: true
        },
        duration_time: {
            type: Number,
            default: 0,
            required: false,
            trim: true
        },
        file_status: {
            type: String,
            default: 'uploaded',
            required: false,
            trim: true
        }
    },
    age_group: {
        min_age: {
            type: Number,
            default: 0,
            required: false,
            trim: true
        },
        max_age: {
            type: Number,
            default: 0,
            required: false,
            trim: true
        }
    },
    gender: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    availablity_locality: {
        latitude: {
            type: Number,
            default: '',
            required: false,
            trim: true
        },
        longitude: {
            type: Number,
            default: '',
            required: false,
            trim: true
        },
        radius: {
            type: Number,
            default: '',
            required: false,
            trim: true
        }
    },
    schedule: {
        start_date: {
            type: Date,
            default: '',
            required: false,
            trim: true
        },
        end_date: {
            type: Date,
            default: '',
            required: false,
            trim: true
        }
    },
    advert_type: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    thumbnail: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    custom_thmbnail:{
       type:String,
       trim:true
    },
    number_of_times_viewed: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    number_of_times_complete_viewed: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    number_of_times_link_clicked: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    duration_of_view: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    advert_status: {
        type: String,
        default: 'No media',
        required: false,
        trim: true
    },
    smil_file_name: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    advert_flavor_available: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transcodingpofile'
    }
    ],
    cost_per_view: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    cost_per_click: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    number_of_likes: {
        type: Number,
        default: '0',
        required: false,
        trim: true
    },
    current_like_bucket:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Like_History',
      autopopulate:{select:'like_by_users'}
    },
    total_comment_bucket:{
        type:Number,
        default:0,
        required:false
    },
    current_comment_bucket:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment_History'
    },
    comment_bucket_ids:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment_History'
    }],
    number_of_comments:{
        type:Number,
        default:0,
        requried:false
    },
    client_details: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            default: '',
            required: false,
            trim: true
        }
    },
    total_earning_from_ads: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    total_money_flow_by_advert: {
        type: Number,
        default: 0,
        required: false,
        trim: true
    },
    description: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
    marital: {
        type: String,
        default: '',
        required: false,
        trim: true
    },
   analytics:{
      number_of_calls:{
          type:Number,
          default:0,
          requried:false,
          trim: true
      },
      number_of_visits:{
          type:Number,
          default:0,
          requried:false,
          trim: true
      }

    },
   phonenumber:{
     type:Number,
     default:0,
     requried:false,
     trim: true
   }
});

function stringNotNull(obj) {
    return obj.length
}

Advert_Schema.plugin(softDelete);
Advert_Schema.plugin(timestamps);
Advert_Schema.plugin(autopopulate);
var Advert = mongoose.model('Advert', Advert_Schema);
module.exports = Advert
