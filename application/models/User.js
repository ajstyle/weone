 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var UserSchema = new mongooseSchema({
    sequenceId:{
      type: Number,
      default: -1
    },
     name: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     username: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     role: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     address: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Address'
     },
     age: {
         type: Number,
         default: 0,
         required: false,
         trim: true
     },
     date_of_birth: {
         type: Date,
         default: '',
         required: false,
         trim: true
     },
     gender: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     phonenumber: {
         type: Number,
         default: '',
         required: false,
         trim: true,
         unique : true,
     },
     otp_code: {
         type: Number,
         default: '',
         required: false,
         trim: true
     },
     image_url: {
         type: String,
         required: false,
         trim: true
     },
     logo_image_url: {
         type: String,
         required: false,
         trim: true,
         default: 'none'
     },
     client_org_name: {
         type: String,
         required: false,
         trim: true,
         default: ''
     },
     user_earning_buckets: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Userearningbucket'
     }],
     current_user_earning_bucket: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Userearningbucket'
     },
        user_invite_people:[{
            type: Number,
            required: false
        }],
        user_invited_people_count:{
            type: Number,
            required: false,
            default:0
        },
     friends: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
     }],
     blockFriends: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
     }],
     hiddenFriends: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
     }],
     email: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     password: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     salt: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     accountLocked: {
         type: Boolean,
         default: false,
         required: true,
         trim: true
     },
     isAccountActive: {
         type: Boolean,
         default: false,
         required: true,
         trim: true
     },
     isAccountDeleted: {
         type: Boolean,
         default: false,
         required: true,
         trim: true
     },
     created: {
         type: Date,
         default: Date.now
     },
     neo4J_node_id: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     newMobileNo: {
         type: Number,
         default: 0,
         required: false
     },
     registration_token: {
         type: String,
         trim: true
     },
     app_platform: {
         type: String,
         trim: true
     },
     device_status: {
         type: Boolean,
         trim: true,
         default: true
     },
     notification_status: {
         type: Boolean,
         trim: true,
         default: true
     },
     last_seen_status: {
         type: Boolean,
         trim: true,
         default: true
     },
     view_profile_status: {
         type: Boolean,
         trim: true,
         default: true
     },
     read_recepit_status:{
         type: Boolean,
         trim: true,
         default: true
     },
     last_seen_time:{
       type:Date,
       default:0
     },
     user_account: {
         wallet: {
             wallet_type: {
                 type: String,
                 default: '',
                 required: false,
                 trim: true
             },
             wallet_id: {
                 type: String,
                 default: '',
                 required: false,
                 trim: true
             },
             wallet_amount_available: {
                 type: Number,
                 default: 0,
                 required: false,
                 trim: true
             },
             amount_to_credit_till_date: {
                 type: Number,
                 default: 0,
                 required: false,
                 trim: true
             },
             currency_type: {
                 type: String,
                 default: "Rupee",
                 required: false
             },
             account_transaction_bucket: [{
                 type: mongoose.Schema.Types.ObjectId,
                 ref: 'AccountTransactionBucket'
             }],
             account_transaction_current_bucket: {
                 type: mongoose.Schema.Types.ObjectId,
                 ref: 'AccountTransactionBucket'
             }
         }
     },
     location: {
         latitude: {
             type: Number,
             default: 0,
             required: false
         },
         longitude: {
             type: Number,
             default: 0,
             required: false
         },
         state: {
             type: String,
             default: 'N/A',
             requried: false,
             trim: true
         },
         city: {
             type: String,
             default: 'N/A',
             requried: false,
             trim: true
         },
         pincode:{
             type: String,
             default: 'N/A',
             requried: false,
             trim: true
         }
     },
     client_account: {
         client_charges_available: {
             type: Number,
             default: 0
         },
         client_charges_till_date: {
             type: Number,
             default: 0
         }
     },
     user_account_details_id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User_Account_Details'
     },
     user_beneficiary_add_status:{
          type: String,
          default: 'no',
          enum: ['no', 'yes','error']
     },
     otp_code_email_update: {
         type: Number,
         default: '',
         required: false,
         trim: true
     },
     updated_email: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     badge_count_ios:{
         global_badge_count:{
           type: Number,
           default: 0,
           required: false
         },
         reward_badge_count:{
           type: Number,
           default: 0,
           required: false
         },
         chat_badge_count:{
           type: Number,
           default: 0,
           required: false
         },
         update_badge_count:{
           type: Number,
           default: 0,
           required: false
         }
     },
     referralId:{
       type:String
     },
     inviter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
     },
     userPin: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     isPhonenumberVerified:{
       type: Boolean,
       default: false,
       required: true
     }
 });

 UserSchema.pre('findOneAndUpdate', function (next) {
     this.options.runValidators = true;
     next();
 });

 UserSchema.plugin(timestamps);
 UserSchema.plugin(softDelete);
 //configuring different access level for the USER
 /*UserSchema.plugin(require('mongoose-role'), {
     roles: configurationHolder.config.roles,
     accessLevels: configurationHolder.config.accessLevels
 });*/

 function stringNotNull(obj) {
     return obj.length
 }



 var User = mongoose.model('User', UserSchema);
 module.exports = User
