const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['City', 'Province']
    },
    nameWithType: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Deleted'],
        default: 'Active'
    },
    deleteAt: {
        type: Date
    }
}, {
    timestamps: true
});
Schema.plugin(mongoosePaginate);

const objectModel = mongoose.model('City', Schema);
module.exports = objectModel;