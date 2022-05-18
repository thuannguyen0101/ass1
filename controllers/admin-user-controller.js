const User = require("../models/user");
const City = require('../models/city');
const District = require('../models/district');
const Ward = require('../models/ward');
const bcrypt = require('bcrypt');
require('mongoose-paginate-v2');

exports.signIn = function (req, res) {
    res.render('admin/user/sign-in', {
        title: 'Sign In',
        message: 'Sign in to start your session'
    });
}

exports.processSignIn = async function (req, res) {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        res.render('admin/user/sign-in', {
            title: 'Sign In',
            message: 'Your email and/or password are incorrect. Please check and try again.'
        });
    } else {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (!result) {
                res.render('admin/user/sign-in', {
                    title: 'Sign In',
                    message: 'Your email and/or password are incorrect. Please check and try again.'
                })
            } else {
                req.session.user = user;
                res.redirect('/admin');
            }
        })
    }
}

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active',
        }
        if (req.query.role && Number(req.query.role) !== 0) {
            filter.role = req.query.role;
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{firstName: regex}, {lastName: regex}, {email: regex}, {phone: regex}]
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 25,
            populate: ['address.cityId', 'address.districtId', 'address.wardId']
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'oldest':
                options.sort = {createdAt: 1}
                break;
            case 'nameAsc':
                options.sort = {firstName: 1}
                break;
            case 'nameDesc':
                options.sort = {firstName: -1}
                break;
            default:
                sort = 'newest'
                options.sort = {createdAt: -1}
        }
        let message = req.session.messageUserSuccess;
        delete req.session.messageUserSuccess;
        const result = await User.paginate(filter, options);
        res.render('admin/user/list', {
            title: 'User List',
            listUser: result.docs,
            userCount: result.totalDocs,
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            pagingCounter: result.pagingCounter,
            role: req.query.role,
            keyword: keyword,
            sort: sort,
            message: message
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.create = async function (req, res, next) {
    try {
        const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
        res.render('admin/user/form', {
            dataUser: {},
            title: 'Create New User',
            listCity: listCity,
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

exports.store = async function (req, res, next) {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const dataUser = await User.create(parseForm(req.body));
        req.session.messageUserSuccess = `User ${dataUser.firstName} ${dataUser.lastName} has been created! Details <a href="/admin/user/update/${dataUser._id}" class="alert-link">here</a>.`
        res.redirect('/admin/user/list');
    } catch (err) {
        if (err.errors && err.errors.email && err.errors.email.kind === 'unique') {
            const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
            res.render('admin/user/form', {
                dataUser: req.body,
                listCity: listCity,
                title: 'Create New User',
                message: 'User cannot be created because email is already in use.'
            });
        } else {
            res.status(500);
            next(err);
        }
    }
}

exports.update = async function (req, res, next) {
    try {
        const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
        const dataUser = await User.findById(req.params.id);
        const listDistrict = await District.find({cityId: dataUser.address.cityId, status: 'Active'});
        const listWard = await Ward.find({districtId: dataUser.address.districtId, status: 'Active'});
        res.render('admin/user/form', {
            dataUser: dataUser,
            title: 'Update User',
            listCity: listCity,
            listDistrict: listDistrict,
            listWard: listWard
        });
    } catch (err) {
        res.status(500);
        next(err);
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
        req.session.messageUserSuccess = `User ${dataUser.firstName} ${dataUser.lastName} has been updated! Details <a href="/admin/user/update/${dataUser._id}" class="alert-link">here</a>.`
        res.redirect('/admin/user/list');
    } catch (err) {
        if (err.errors && err.errors.email && err.errors.email.kind === 'unique') {
            req.body._id = 'exists';
            res.render('admin/user/form', {
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

exports.delete = async function (req, res, next) {
    try {
        const dataUser = await User.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageUserSuccess = `User ${dataUser.firstName} ${dataUser.lastName} has been deleted!`;
        res.redirect('/admin/user/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}