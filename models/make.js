var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    },
    kind: {
        type: String,
        enum: ['Car', 'Motorcycle', 'Both'],
        require: true
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
Schema.plugin(uniqueValidator);

const carModel = mongoose.model('Make', Schema);
module.exports = carModel;

