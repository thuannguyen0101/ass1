const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Subject = Object.freeze(['Customer service', 'GDPR and privacy', 'Website technical issues', 'Other requests']);

const Schema = new mongoose.Schema({
    subject: {
        type: String,
        enum: Subject,
        required: true
    },
    title: {
        type: String,
        require: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isReplied: {
        type: Boolean,
        default: false
    },
    isStarred: {
        type: Boolean,
        default: false
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
Object.assign(Schema.statics, {
    Subject
});

const objectModel = mongoose.model('Message', Schema);
module.exports = objectModel;