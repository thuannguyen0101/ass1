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
        enum: ['ward', 'village', 'town']
    },
    nameWithType: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    pathWithType: {
        type: String,
        required: true
    },
    districtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
        required: true
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    parentCode: {
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
},{
    timestamps: true
});
Schema.plugin(mongoosePaginate);

const objectModel = mongoose.model('Ward', Schema);
module.exports = objectModel;