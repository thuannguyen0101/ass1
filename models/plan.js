const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');

const numberLimitSchema = new mongoose.Schema({
    claimLimitValue: {
        type: Number,
        required: [true, 'Please enter a claim limit']
    },
    formula: {
        type: String,
        required: [true, 'Please enter a formula']
    }
});
const stringLimitSchema = new mongoose.Schema({
    claimLimitText: {
        type: String,
        default: 'Full cash value of the vehicle',
        required: [true, 'Please enter a claim limit']
    },
    deductible: {
        type: Number,
        required: [true, 'Please enter a deductible value']
    },
    formula: {
        type: String,
        required: [true, 'Please enter a formula']
    }
});

const Schema = new mongoose.Schema({
    insurerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Insurer',
        required: [true, 'Please select an insurer']
    },
    kind: {
        type: String,
        enum: ['Car', 'Motorcycle'],
        required: [true, 'Please select a vehicle kind (Car or Motorcycle)']
    },
    name: {
        type: String,
        required: [true, 'Please enter a name']
    },
    color: {
        type: String,
        required: [true, 'Please select a color']
    },
    description: {
        type: String,
    },
    mainCoverages: {
        liabilityBody: numberLimitSchema,
        liabilityProperty: numberLimitSchema,
        personalMedical: numberLimitSchema,
        personalBody: numberLimitSchema,
        personalProperty: numberLimitSchema,
        vehicleCollision: stringLimitSchema,
        vehicleComprehensive: stringLimitSchema,
        vehicleRentalReimbursement: numberLimitSchema,
        vehicleTowing: numberLimitSchema,
    },
    carCoverages: {
        personalIdentityTheft: numberLimitSchema,
        vehicleSoundSystem: numberLimitSchema,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Deleted'],
        default: 'Active'
    },
    deletedAt: {
        type: Date
    },
}, {
    timestamps: true
})

Schema.plugin(mongoosePaginate);
Schema.plugin(uniqueValidator);

const objectModel = mongoose.model('Plan', Schema);
module.exports = objectModel;