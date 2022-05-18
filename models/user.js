const mongoose = require('mongoose');
const ejs = require('ejs');
const mailer = require('../mailer');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');

const EducationLevel = Object.freeze({
    NoHighSchoolDiploma: 1,
    HighSchoolDiploma: 2,
    Associate: 3,
    Bachelors: 4,
    Masters: 5,
    PhD: 6
});

const EmploymentStatus = Object.freeze({
    Employed: 1,
    Student: 3,
    Retired: 2,
    Unemployed: 5,
    Other: 4
});

const Schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: Number,
        required: true,
        max: 1,
        min: 0
    },
    dob: {
        required: true,
        type: Date,
    },
    address: {
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            required: true
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true
        },
        wardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ward',
            required: true
        },
        street: {
            type: String,
            required: true,
        }
    },
    phone: {
        type: String,
        required: true,
        min: 7,
        max: 15,
        index: true
    },
    educationLevel: {
        type: Number,
        enum: Object.values(EducationLevel),
        required: true
    },
    employmentStatus: {
        type: Number,
        enum: Object.values(EmploymentStatus),
        required: true
    },
    drivingRecords: [
        {
            incidentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Incident',
                required: true
            },
            incidentName: {
                type: String,
                required: true
            },
            incidentType: {
                type: String,
                enum: ['Accident', 'Violation'],
                required: true
            },
            incidentYear: {
                type: Number,
                required: true
            }
        }
    ],
    role: {
        type: Number,
        enum: [1, 2], // 1 for User, 2 for Admin
        default: 1
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

Schema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
});

Object.assign(Schema.statics, {
    EducationLevel,
    EmploymentStatus
});

Schema.plugin(mongoosePaginate);
Schema.plugin(uniqueValidator);

Schema.pre('save', async function (next) {
    if (this.isNew) {
        ejs.renderFile('views/email/welcome.ejs', {user: this})
            .then(content => mailer.sendMail(this.email, 'Welcome to Safe Carz', content))
    }
    next();
});

const objectModel = mongoose.model('User', Schema);
module.exports = objectModel;