const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Status = Object.freeze({
    Active: 'Active',
    Inactive: 'Inactive',
    Deleted: 'Deleted',
});

const Schema = new mongoose.Schema({
    kind: {
        type: String,
        enum: ['Car', 'Motorcycle'],
        required: true
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Make',
        required: true
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Type',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: 'Active',
        required: true
    },
    deletedAt:{
        type: Date
    },
}, {
    timestamps: true
})
Schema.plugin(mongoosePaginate);
Object.assign(Schema.statics, {
    Status,
});
const objectModel = mongoose.model('Model', Schema);
module.exports = objectModel;