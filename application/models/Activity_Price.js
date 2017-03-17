var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var Activity_Price = new mongooseSchema({

    youtube: {
        videoviews: {
            type: Number,
            default: 0,
            required: false
        },
        subscribers: {
            type: Number,
            default: 0,
            required: false
        },
        likes: {
            type: Number,
            default: 0,
            required: false
        },
        dislikes: {
            type: Number,
            default: 0,
            required: false
        },
        comments: {
            type: Number,
            default: 0,
            required: false
        }
    },
    facebook: {
        pagefans: {
            type: Number,
            default: 0,
            required: false
        },
        follows: {
            type: Number,
            default: 0,
            required: false
        },
        websitelikes: {
            type: Number,
            default: 0,
            required: false
        },
        statuslikes: {
            type: Number,
            default: 0,
            required: false
        },
        shares: {
            type: Number,
            default: 0,
            required: false
        }
    },
    website: {
        visit: {
            type: Number,
            default: 0,
            required: false
        }
    }
});

function stringNotNull(obj) {
    return obj.length
}

Activity_Price.plugin(softDelete);
Activity_Price.plugin(timestamps);

var Activity_Price = mongoose.model('Activity_Price', Activity_Price);
module.exports = Activity_Price
