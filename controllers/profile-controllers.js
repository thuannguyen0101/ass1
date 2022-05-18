const User = require("../models/user");
const City = require('../models/city');
const District = require('../models/district');
const Ward = require('../models/ward');
const bcrypt = require('bcrypt');

require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let message = req.session.messageUserSuccess;
        const dataUser = await User.findOne({email: req.session.user.email,})
            .populate('address.cityId')
            .populate('address.districtId')
            .populate('address.wardId')
        res.render('my-profile', {
            dataUser: dataUser,
            message: message,
            title: 'My Profile'
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
        const dataUser = await User.findById(req.params.id);
        const listDistrict = await District.find({cityId: dataUser.address.cityId, status: 'Active'});
        const listWard = await Ward.find({districtId: dataUser.address.districtId, status: 'Active'});
        res.render('my-profile-repair', {
            dataUser: dataUser,
            title: 'Update Profile',
            listCity: listCity,
            listDistrict: listDistrict,
            listWard: listWard
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

function parseForm(formData) {
    return {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dob: formData.dob,
        educationLevel: formData.educationLevel,
        employmentStatus: formData.employmentStatus,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        address: {
            cityId: formData.cityId,
            districtId: formData.districtId,
            wardId: formData.wardId,
            street: formData.street,
        },
        phone: formData.phone,
        drivingRecords: (formData.drivingRecords) ? JSON.parse(formData.drivingRecords) : [],

    }
}

exports.save = async function (req, res, next) {
    try {
        req.body = parseForm(req.body);
        if (!req.body.password.length) {
            delete req.body.password;
        } else {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const dataUser = await User.findByIdAndUpdate(req.params.id, req.body, {runValidators: true, context: 'query'});
        if (req.session.user && req.session.user._id.toString() === dataUser._id.toString()) {
            req.session.user = dataUser;
        }
        req.session.messageUserSuccess = `User ${dataUser.firstName} ${dataUser.lastName} has been updated! Details <a href="/my-profile/update-my-profile/${dataUser._id}" class="alert-link">here</a>.`
        res.redirect('/my-profile');
    } catch (err) {
        if (err.errors && err.errors.email && err.errors.email.kind === 'unique') {
            req.body._id = 'exists';
            res.render('/my-profile', {
                dataUser: req.body,
                title: 'Update User',
                message: 'User cannot be updated because email is already in use.'
            });
        } else {
            res.status(500);
            next(err);
        }
    }
}