// var mongoose = require('mongoose');
//  // var connectionOne = require('../../configurations/Advertiser_Datasource');
//  // global.advertCon =require('../../configurations/connect_constructor.js').getConstructorConnetion();
//  var softDelete = require('mongoose-softdelete');
//  var timestamps = require('mongoose-timestamp');
//  var AdvertiserSchema = new mongooseSchema({
//      name: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      username: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      role: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      age: {
//          type: Number,
//          default: 0,
//          required: false,
//          trim: true
//      },
//      date_of_birth: {
//          type: Date,
//          default: '',
//          required: false,
//          trim: true
//      },
//      gender: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      phonenumber: {
//          type: Number,
//          default: '',
//          required: false,
//          trim: true,
//          unique : true,
//      },
//      image_url: {
//          type: String,
//          required: false,
//          trim: true
//      },
//      email: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      password: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      salt: {
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//      },
//      accountLocked: {
//          type: Boolean,
//          default: false,
//          required: true,
//          trim: true
//      },
//      isAccountActive: {
//          type: Boolean,
//          default: false,
//          required: true,
//          trim: true
//      },
//      isAccountDeleted: {
//          type: Boolean,
//          default: false,
//          required: true,
//          trim: true
//      },
//      advertiser_profile:{
//        type: String,
//        default: '',
//        required: false,
//        trim: true
//      },
//      company_information:{
//        company_name:{
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//        },
//        tin_number:{
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//        },
//        company_address:{
//          type: String,
//          default: '',
//          required: false,
//          trim: true
//        }
//      },
//      individual_information:{
//              pan_number:{
//                type: String,
//                default: '',
//                required: false,
//                trim: true
//              }
//      },
//      approve_status:{
//          approved: {
//              type: Boolean,
//              default: false,
//              required: true,
//              trim: true
//          },
//          rejected: {
//              type: Boolean,
//              default: false,
//              required: true,
//              trim: true
//          },
//    }
//
//  });
//
//  AdvertiserSchema.pre('findOneAndUpdate', function (next) {
//      this.options.runValidators = true;
//      next();
//  });
//  AdvertiserSchema.plugin(timestamps);
//  AdvertiserSchema.plugin(softDelete);
//  function stringNotNull(obj) {
//      return obj.length
//  }
//
//
//
//  var Advertiser = weone_advertiser.model('Advertiser', AdvertiserSchema);
//  module.exports = Advertiser
