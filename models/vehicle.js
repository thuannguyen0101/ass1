const mongoose = require('mongoose');

const PurchasedCondition = Object.freeze({
    New: 1,
    Old: 0
});

const Schema = new mongoose.Schema({
    kind: {
        type: String,
        enum: ['Car', 'Motorcycle'],
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Make',
        required: true
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    modelNameWithMake: {
        type: String,
        required: true
    },
    vehicleRegistrationPlate: {
        type: String,
        required: true
    },
    vehicleIdentificationNumber: {
        type: String,
        required: true
    },
    engineNumber: {
        type: String,
        require: true
    },
    purchasedDate: {
        type: Date,
        required: true
    },
    purchasedCondition: {
        type: Number,
        enum: Object.values(PurchasedCondition),
        required: true
    },
    annualMileage: {
        type: Number,
        required: true
    },
    isForCommercialUse: {
        type: Boolean,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
}, {
    _id: false
})

Object.assign(Schema.statics, {
    PurchasedCondition
});

const objectModel = mongoose.model('Vehicle', Schema);
module.exports = objectModel;