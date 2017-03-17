var VoucherSchema = new mongooseSchema({

	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required:true
	},

	startDate : {
		type: Date,
		default: Date.now
	},

	endDate : {
		type: Date,
		default: ''
	},

	voucherId : {
		type: String,
		unique:true
	},

	amount : {
		type: Number,
		default:0
	},

	created: {
		type: Date,
		default: Date.now
	},

	updated: {
		type: Date,
		default: Date.now
	},

	status: {
		type: String,
		enum : ['PAID','PENDING','PARTIALLY_PAID','CANCELLED'],
    default : 'PENDING'
	},

	stRegNo:{
		type:String,
		required:false
	},

	neft: {
		type: String,
		required:false,
		default:'N/A'
	}

});

 var voucher = mongoose.model('Voucher', VoucherSchema);
 module.exports = voucher
