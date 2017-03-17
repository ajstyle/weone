var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Pincode_Schema = new mongooseSchema({
        officename:{
          type:String,
          trim:true
        },
        pincode:{
          type:Number,
          required:true
        },
        divisionname:{
          type:String,
          trim:true
        },
        regionname:{
          type:String,
          trim:true
        },
        circlename:{
          type:String,
          trim:true
        },
        statename:{
          type:String,
          trim:true
        },
        officetype:{
          type:String,
          trim:true
        },
        deliverystatus:{
          type:String,
          trim:true
        },
        taluk:{
          type:String,
          trim:true
        },
        districtname:{
          type:String,
          trim:true
        },
        countryname:{
          type:String,
          trim:true
        }
});

function stringNotNull(obj) {
    return obj.length
}

Pincode_Schema.plugin(softDelete);
Pincode_Schema.plugin(timestamps);

var Pincode = mongoose.model('Pincode', Pincode_Schema);
module.exports = Pincode
