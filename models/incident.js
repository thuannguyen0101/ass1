const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['Accident', 'Violation'],
        required: true
    },
    severity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
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

const objectIncident = mongoose.model('Incident', Schema);
module.exports = objectIncident;