 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var VideouploadTokenSchema = new mongooseSchema({
	 authToken: {
		type: String,
		default: '',
		required: true,
		trim: true,
       // validate: [stringNotNull, 'Authentocation token required']
	}, 
    advert_type: {
		type: String,
		default: '',
		required: true,
		trim: true,
	}, 
    advert_id: {
		type: mongooseSchema.ObjectId,
        ref:'Advert'
    },
    name_of_advert:{
      type:String,
      trim:true
    },
    created: {
		type: Date,
		default: Date.now
	}
});

VideouploadTokenSchema.plugin(softDelete);
VideouploadTokenSchema.plugin(timestamps);

function stringNotNull(obj){
    return obj.length
}



var VideouploadToken = mongoose.model('VideouploadToken', VideouploadTokenSchema);
module.exports = VideouploadToken