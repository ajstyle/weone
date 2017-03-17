 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var AuthenticationTokenSchema = new mongooseSchema({
	 authToken: {
		type: String,
		default: '',
		required: true,
		trim: true,
       // validate: [stringNotNull, 'Authentocation token required']
	}, 
    email: {
		type: String,
		default: '',
		required: false,
		trim: true,
      //  validate: [stringNotNull, 'Email required']
	}, 
    user: {
		type: mongooseSchema.ObjectId,
        ref:'User'
    },
    created: {
		type: Date,
		default: Date.now
	}
});

AuthenticationTokenSchema.plugin(softDelete);
AuthenticationTokenSchema.plugin(timestamps);

function stringNotNull(obj){
    return obj.length
}



var AuthenticationToken = mongoose.model('AuthenticationToken', AuthenticationTokenSchema);
module.exports = AuthenticationToken