const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        required: true
    },
    kind: {
        type: String,
        enum: ['Car', 'Motorcycle'],
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
})

Schema.plugin(mongoosePaginate);
Schema.plugin(uniqueValidator);

const objectModel = mongoose.model('Type', Schema);
module.exports = objectModel;