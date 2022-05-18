const User = require("../models/user");
const City = require('../models/city');
const bcrypt = require('bcrypt');

exports.signIn = function (req, res) {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('sign-in', {
            title: 'Sign In',
            message: 'Sign in to start your session',
            query: req.query
        })
    }
}

exports.processSignIn = async function (req, res) {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        res.render('sign-in', {
            title: 'Sign In',
            message: 'Your email and/or password are incorrect. Please check and try again.'
        });
    } else {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (!result) {
                res.render('sign-in', {
                    title: 'Sign In',
                    message: 'Your email and/or password are incorrect. Please check and try again.'
                });
            } else {
                req.session.user = user;
                let redirect = '/';
                if (req.query.r) {
                    redirect += req.query.r;
                } else if (req.session.redirect) {
                    redirect = req.session.redirect;
                    req.session.redirect = undefined;
                }
                res.redirect(redirect);
            }
        })
    }
}

exports.signOut = function (req, res) {
    req.session.user = undefined
    res.redirect('/');
}

exports.signUp = async function (req, res, next) {
    if (req.session.user) {
        res.redirect('/');
    } else {
        try {
            const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
            res.render('sign-up', {
                title: 'Sign Up',
                listCity: listCity,
            })
        } catch (err) {
            res.status(500);
            next(err);
        }
    }
}

exports.processSignUp = async function (req, res, next) {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const dataUser = await User.create(parseForm(req.body));
        res.render('sign-in', {
            title: 'Sign In',
            message: `Congratulations ${dataUser.firstName}! Your account has been created. Please sign in to continue.`
        });
    } catch (err) {
        if (err.errors && err.errors.email && err.errors.email.kind === 'unique') {
            const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
            res.render('sign-up', {
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