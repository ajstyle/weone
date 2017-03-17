var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var User_Account_Details_Schema = new mongooseSchema({
    party_name: {
         type: String,
         required: false,
         trim: true
     },
     acc_no: {
         type: String,
         required: false,
         trim: true
     },
     ifsc_code: {
         type: String,
         required: false,
         trim: true
     },
     branch_code: {
        type: String,
         required: false,
         trim: true
     },
     address: {
         type: String,
         required: false,
         trim: true
     },
        mobile_no: {
         type: Number,
         required: false,
         trim: true
     },
     email_id: {
         type: String,
         required: false,
         trim: true
     },
     pan_card_no: {
         type: String,
         required: false,
         trim: true
     },
      proof_image: [{
         type: String,
         required: false,
         trim: true
     }],
       user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
     },
     pin_code:{
       type: Number,
       required: false,
       trim: true
     },
     city:{
       type:String,
       required: false,
       trim: true
     }

     });


 User_Account_Details_Schema.plugin(timestamps);
 User_Account_Details_Schema.plugin(softDelete);


 var User_Account_Details = mongoose.model('User_Account_Details', User_Account_Details_Schema);
 module.exports = User_Account_Details;
