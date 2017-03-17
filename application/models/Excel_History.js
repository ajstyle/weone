 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var ExcelHistorySchema = new mongooseSchema({
     excel_action_date:{
         type: Date,
         default:Date.now
     },
     excel_action_type:{
         type:String,
         default:'none',
         required:true
     },
     name_excel_file:{
         type:String,
         required:true
     },
     action_type:{
         type:String,
         required:true,
         enum: ['beneficiary','transaction','voucher']
     }
 });

 function stringNotNull(obj) {
     return obj.length
 }

 var ExcelHistory = mongoose.model('ExcelHistory',ExcelHistorySchema);
 module.exports = ExcelHistory
