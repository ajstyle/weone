 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var AddressSchema = new mongooseSchema({
	/*addressLine1: {
		type: String,
		default: '',
		required: true,
		trim: true,
        validate: [stringNotNull, 'address required']
	}, 
    addressLine2: {
		type: String,
		default: '',
		required: true,
		trim: true
	},*/
    city: {
		type: String,
		default: '',
		required: true,
		trim: true
	},
    state: {
		type: String,
		default: '',
		required: true,
		trim: true
	},
    country: {
		type: String,
		default: 'INDIA',
		required: true,
		trim: true
	},
    created: {
		type: Date,
		default: Date.now
	}
});


function stringNotNull(obj){
    return obj.length
}

AddressSchema.plugin(softDelete);
AddressSchema.plugin(timestamps);

var Address = mongoose.model('Address', AddressSchema);
module.exports = Address
