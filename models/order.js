const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const User = require('../models/user');

const PurchasedCondition = Object.freeze({
    New: 1,
    Old: 0
});

const Schema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
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
    },
    plan: {},
    shippingAddress: {
        name: {
            type: String,
        },
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City'
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District'
        },
        wardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ward'
        },
        street: {
            type: String
        },
        phone: {
            type: String
        },
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Created', 'Confirmed', 'Paid', 'Shipped', 'Canceled', 'Deleted'],
        default: 'Created',
        required: true
    },
    confirmedAt: {
        type: Date
    },
    paidAt: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['PayPal', 'Bank Transfer', 'Cash']
    },
    shippedAt: {
        type: Date
    },
    canceledAt: {
        type: Date
    },
    cancelReason: {
        type: String
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
})

Object.assign(Schema.statics, {
    PurchasedCondition
});

Schema.plugin(mongoosePaginate);

const objectModel = mongoose.model('Order', Schema);
module.exports = objectModel;