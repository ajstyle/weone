var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');

var User_Phonebook_Schema = new mongooseSchema({

    user_id: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },

    phonebook_details:[{
      _id:false,
      name: {
          type: String,
          trim: true
      },
      phonenumber: {
           type: String,
           trim: true
      }
   }],

   lastSyncTimestamp:{
     type:Date,
     trim:true,
   }

});

function stringNotNull(obj) {
    return obj.length
}

User_Phonebook_Schema.plugin(softDelete);
User_Phonebook_Schema.plugin(timestamps);

var User_Phonebook = mongoose.model('User_phonebook_history', User_Phonebook_Schema);
module.exports = User_Phonebook

