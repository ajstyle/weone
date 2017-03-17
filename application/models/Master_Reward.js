 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var Master_Reward_Schema = new mongooseSchema({
     name: {
         type: String,
         default: '',
         required: true,
         trim: true
     },
     text_to_display: {
         type: String,
         default: '',
         required: true,
         trim: true
     },
     type: {
         type: String,
         default: '',
         required: true,
         trim: true
     },
     reward_id: {
         type: String,
         default: '',
         trim: true
     },
     coupon: {
         coupon_code: {
             type: String,
             trim: true
         },
         /* start_date: {
              type: Date
          },
          end_date: {
              type: Date
          }*/
     },
     cash_amount: {
         type: Number,
         default: 0,
         required: true,
         trim: true
     },
     reward_Date: {
         type: Date,
         default: Date.now
     },
     user_details: {
         user_id: {
             type: mongoose.Schema.Types.ObjectId,
             ref: 'User'
         },
         age: {
             type: Number,
             default: 0,
         },
         gender: {
             type: String,
             default: '',
             required: false,
             trim: true
         }
     }
 });

 function stringNotNull(obj) {
     return obj.length
 }

 Master_Reward_Schema.plugin(softDelete);
 Master_Reward_Schema.plugin(timestamps);

 var Master_Reward = mongoose.model('MasterReward', Master_Reward_Schema);
 module.exports = Master_Reward