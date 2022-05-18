const Insurer = require('../models/insurer');
const Plan = require('../models/plan');
const User = require('../models/user');
const City = require('../models/city');
const District = require('../models/district');
const Ward = require('../models/ward');
const Model = require('../models/model');
const Incident = require('../models/incident');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');

exports.validate = function (form) {
    switch (form) {
        case 'driver': {
            return [
                check('firstName', 'First name is required').not().isEmpty(),
                check('lastName', 'Last name is required').not().isEmpty(),
                check('gender', 'Gender is required').isIn([0, 1]),
                check('cityId', 'City is required').not().isEmpty(),
                check('districtId', 'District is required').not().isEmpty(),
                check('wardId', 'Ward is required').not().isEmpty(),
                check('street', 'Street is required').not().isEmpty(),
                check('dob', 'Invalid birthday').isDate().not().isAfter(new Date().toDateString()),
                check('email', 'Invalid email').isEmail(),
                check('phone', 'Invalid phone').isLength({min: 8, max: 15}),
                check('educationLevel', 'Education level is required').isIn(Object.values(User.EducationLevel)),
                check('employmentStatus', 'Employment status is required').isIn(Object.values(User.EmploymentStatus)),
            ]
        }
        case 'vehicle': {
            return [
                check('kind', 'Kind is required').isIn(['Car', 'Motorcycle']),
                check('year', 'Invalid year').isInt({max: new Date().getFullYear()}),
                check('makeId', 'Make is required').not().isEmpty(),
                check('modelId', 'Model is required').not().isEmpty(),
                check('vehicleIdentificationNumber', 'Vehicle identification number is required').not().isEmpty(),
                check('purchasedDate', 'Invalid purchased date').isDate().not().isAfter(new Date().toDateString()),
                check('annualMileage', 'Invalid annual mileage').isInt()
            ]
        }
        case 'options': {
            return []
        }
    }
}

exports.load = async function (req, res) {
    uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
    const listInsurer = await Insurer.find({status: 'Active'});
    const listPlan = await Plan.find({status: 'Active'});
    const listCarInsurerId = uniqueArray(listPlan.filter(item => item.kind === 'Car').map(a => a.insurerId));
    const listMotorcycleInsurerId = uniqueArray(listPlan.filter(item => item.kind === 'Motorcycle').map(a => a.insurerId));
    const listCarInsurer = listInsurer.filter(item => listCarInsurerId.includes(item._id.toString()));
    const listMotorcycleInsurer = listInsurer.filter(item => listMotorcycleInsurerId.includes(item._id.toString()));
    const listCity = await City.find({status: 'Active'});
    let listDistrict = [], listWard = [];
    if (req.session.user) {
        listDistrict = await District.find({cityId: req.session.user.address.cityId, status: 'Active'});
        listWard = await Ward.find({districtId: req.session.user.address.districtId, status: 'Active'});
    }
    res.render('quote', {
        title: 'Get a Quote',
        listCarInsurer: listCarInsurer,
        listMotorcycleInsurer: listMotorcycleInsurer,
        listCity: listCity.sort((a, b) => a.name.localeCompare(b.name, 'en', {'sensitivity': 'base'})),
        listDistrict: listDistrict,
        listWard: listWard
    })
}

exports.start = async function (req, res) {
    try {
        const [listModel, listIncident] = await Promise.all([
            Model.find({status: 'Active'}).populate('makeId'),
            Incident.find({status: 'Active'})
        ]);
        res.status(201).json({
            listModel: listModel,
            listIncident: listIncident
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            errors: [{
                errors: 'Internal Server Error',
                msg: 'An error occurred. Please try again later.'
            }]
        });
    }
}

exports.submitDriver = async function (req, res) {
    req.body.drivingRecords = JSON.parse(req.body.drivingRecords);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        if (!req.session.quote) {
            req.session.quote = {}
        }
        req.session.quote.address = {
            cityId: req.body.cityId,
            districtId: req.body.districtId,
            wardId: req.body.wardId,
            street: req.body.street,
        };
        if (req.session.user) {
            req.session.user = await User.findByIdAndUpdate(req.session.user._id, req.session.quote, {new: true});
        }
        Object.assign(req.session.quote, req.body);
        const data = JSON.stringify(req.body);
        res.status(201).json(data);
    } else {
        console.log(errors);
        res.status(400).json(errors);
    }
}

exports.submitVehicle = function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        Object.assign(req.session.quote, req.body);
        const data = JSON.stringify(req.body);
        res.status(201).json(data);
    } else {
        console.log(errors);
        res.status(400).json(errors);
    }
}

exports.submitOptions = async function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        if (!req.session.quote) {
            req.session.quote = {}
        }
        Object.assign(req.session.quote, req.body);
        let quote = req.session.quote;
        // Parse user input values
        const gender = quote.gender;
        const cityType = (await City.findById(quote.cityId)).type;
        const age = new Date(new Date() - new Date(quote.dob)).getFullYear();
        const educationLevel = quote.educationLevel;
        const employmentStatus = quote.employmentStatus;
        const hasIncident = Boolean(quote.hasIncident);
        const incidentCount = quote.drivingRecords.length;
        const severityTotal = 10;
        const severityHighest = 8;
        const accidentSeverityCount = 1;
        const accidentSeverityTotal = 2;
        const accidentSeverityHighest = 2;
        const violationSeverityCount = 1;
        const violationSeverityTotal = 8;
        const violationSeverityHighest = 8;
        const year = quote.year;
        const makeId = quote.makeId;
        const modelId = quote.modelId;
        const model = await Model.findById(modelId);
        const typeId = model.typeId;
        const vehicleValue = model.value;
        const purchasedDate = new Date(quote.purchasedDate);
        const isNew = Boolean(quote.purchasedCondition);
        const annualMileage = quote.annualMileage;
        let filterPlan = {
            kind: quote.kind,
            status: 'Active'
        }
        if (quote.insurerId) {
            filterPlan.insurerId = quote.insurerId;
        } else {
            quote.mainCoverages.forEach(coverage => {
                filterPlan[`mainCoverages.${coverage}.claimLimitValue`] = {$ne: 0};
            })
            quote.carCoverages.forEach(coverage => {
                filterPlan[`carCoverages.${coverage}.claimLimitValue`] = {$ne: 0};
            })
        }
        let listPlan = await Plan.find(filterPlan).populate('insurerId').lean();
        listPlan.forEach(plan => {
            plan.planPrice = 0;
            plan.liabilityPrice = 0;
            plan.personalPrice = 0;
            plan.vehiclePrice = 0;
            plan.claimLimit = 0;
            Object.keys(plan.mainCoverages).forEach(coverage => {
                plan.mainCoverages[coverage].price = eval(plan.mainCoverages[coverage].formula);
                delete plan.mainCoverages[coverage].formula;
                plan.planPrice += plan.mainCoverages[coverage].price;
                plan.claimLimit += plan.mainCoverages[coverage].claimLimitValue || 0;
                if (coverage.indexOf('liability') === 0) {
                    plan.liabilityPrice += plan.mainCoverages[coverage].price;
                } else if (coverage.indexOf('personal') === 0) {
                    plan.personalPrice += plan.mainCoverages[coverage].price;
                } else {
                    plan.vehiclePrice += plan.mainCoverages[coverage].price;
                }
            });
            if (quote.kind === 'Car') {
                Object.keys(plan.carCoverages).forEach(coverage => {
                    plan.carCoverages[coverage].price = eval(plan.carCoverages[coverage].formula);
                    delete plan.carCoverages[coverage].formula;
                    plan.planPrice += plan.carCoverages[coverage].price;
                    plan.claimLimit += plan.carCoverages[coverage].claimLimitValue || 0;
                    if (coverage.indexOf('liability') === 0) {
                        plan.liabilityPrice += plan.carCoverages[coverage].price;
                    } else if (coverage.indexOf('personal') === 0) {
                        plan.personalPrice += plan.carCoverages[coverage].price;
                    } else {
                        plan.vehiclePrice += plan.carCoverages[coverage].price;
                    }
                });
            }
        })
        if (quote.priority === 'claimLimitHighest') {
            listPlan.sort((a, b) => (a.claimLimit > b.claimLimit) ? -1 : 1);
        } else {
            listPlan.sort((a, b) => (a.planPrice > b.planPrice) ? 1 : -1);
        }
        if (!quote.insurerId) {
            listPlan = listPlan.slice(0, 3);
        }
        req.session.listPlan = listPlan;
        res.status(201).json(listPlan);
    } else {
        console.log(errors);
        res.status(400).json(errors);
    }
}

exports.submitShipping = async function (req, res, next) {
    try {
        Object.assign(req.session.quote, req.body);
        const data = JSON.stringify(req.body);
        res.status(201).json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: 'Internal server error.'
        });
    }
}

exports.submitSignUp = async function (req, res, next) {
    try {
        Object.assign(req.session.quote, req.body);
        req.session.quote.password = await bcrypt.hash(req.session.quote.password, 10);
        req.session.quote.role = 1;
        const dataUser = await User.create(req.session.quote);
        req.session.user = dataUser;
        const data = JSON.stringify(dataUser);
        res.status(201).json(data);
    } catch (err) {
        if (err.errors && err.errors.email && err.errors.email.kind === 'unique') {
            res.status(400).json({
                message: 'Email is already in use. Please enter another.'
            })
        } else {
            console.log(err);
            res.status(400).json(err);
        }
    }
}