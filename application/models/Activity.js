 // var softDelete = require('mongoose-softdelete');
 // var timestamps = require('mongoose-timestamp');
 // var  ActivitySchema = new mongooseSchema({
 //     advertiserId: {
 //       type: mongooseSchema.ObjectId,
 //       ref:'advertiser'
 //     },
 //     activity_type: {
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //     },
 //     page_like: {
 //       number_of_likes:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //   },
 //     comment: {
 //       number_of_comments:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //     share: {
 //       number_of_shares:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //     view: {
 //       number_of_views:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //     follow: {
 //       number_of_follows:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //     like:{
 //       number_of_likes:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //     subscribe:{
 //       number_of_subscribes:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //     review:{
 //       number_of_reviews:{
 //         type: Number,
 //         default: '',
 //         required: false,
 //         trim: true
 //       },
 //       url:{
 //         type: String,
 //         default: '',
 //         required: false,
 //         trim: true
 //       }
 //     },
 //    approve_status:{
 //       approved: {
 //           type: Boolean,
 //           default: false,
 //           required: true,
 //           trim: true
 //       },
 //       rejected: {
 //           type: Boolean,
 //           default: false,
 //           required: true,
 //           trim: true
 //       }
 //   }
 //
 // });
 //
 //
 // ActivitySchema.plugin(timestamps);
 // ActivitySchema.plugin(softDelete);
 // function stringNotNull(obj) {
 //     return obj.length
 // }
 //
 // var Activity = mongoose.model('Activity', ActivitySchema);
 // module.exports = Activity
