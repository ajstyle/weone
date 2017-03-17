var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Account_Transaction_Bucket_Schema = new mongooseSchema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    credit_transactions_history: [{
        date_of_transaction: {
            type: Date,
            default: Date.now
        },
        amount_credit: {
            type: Number,
            default: 0
        },
        currency_type: {
            type: String,
            default: "Rupee"
        },
        account_no: {
            type: Number,
            default: 0
        },
        ifsc_code: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        party_name:{
            type:String,
            trim:true
        },
        unique_ref_code:{
            type:String,
            trim:true
        },
        date_of_transaction_from_excel:{
            type:String,
            trim:true
        }
    }],
    credit_transactions_count: {
        type: Number,
        default: 0
    }
});

function stringNotNull(obj) {
    return obj.length
}

Account_Transaction_Bucket_Schema.plugin(softDelete);
Account_Transaction_Bucket_Schema.plugin(timestamps);

var AccountTransactionBucket = mongoose.model('AccountTransactionBucket', Account_Transaction_Bucket_Schema);
module.exports = AccountTransactionBucket