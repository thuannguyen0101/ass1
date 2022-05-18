const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slogan: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    foundedAt: {
        type: Date
    },
    headquarter: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive', 'Deleted'],
        default: 'Active'
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true,
})
Schema.plugin(mongoosePaginate);

const objectModel = mongoose.model('Insurer', Schema);
module.exports = objectModel;