const Plan = require('../models/plan');
const Insurer = require('../models/insurer');
require('mongoose-paginate-v2');

function parseForm(formData) {
    return {
        insurerId: formData.insurerId,
        kind: formData.kind,
        name: formData.name,
        color: formData.color,
        mainCoverages: {
            liabilityBody: {
                claimLimitValue: formData.liabilityBodyClaimLimitValue,
                formula: formData.liabilityBodyFormula
            },
            liabilityProperty: {
                claimLimitValue: formData.liabilityPropertyClaimLimitValue,
                formula: formData.liabilityPropertyFormula
            },
            personalMedical: {
                claimLimitValue: formData.personalMedicalClaimLimitValue,
                formula: formData.personalMedicalFormula
            },
            personalBody: {
                claimLimitValue: formData.personalBodyClaimLimitValue,
                formula: formData.personalBodyFormula
            },
            personalProperty: {
                claimLimitValue: formData.personalPropertyClaimLimitValue,
                formula: formData.personalPropertyFormula
            },
            vehicleCollision: {
                claimLimitText: formData.vehicleCollisionClaimLimitText,
                deductible: formData.vehicleCollisionDeductible,
                formula: formData.vehicleCollisionFormula
            },
            vehicleComprehensive: {
                claimLimitText: formData.vehicleComprehensiveClaimLimitText,
                deductible: formData.vehicleComprehensiveDeductible,
                formula: formData.vehicleComprehensiveFormula
            },
            vehicleRentalReimbursement: {
                claimLimitValue: formData.vehicleRentalReimbursementClaimLimitValue,
                formula: formData.vehicleRentalReimbursementFormula
            },
            vehicleTowing: {
                claimLimitValue: formData.vehicleTowingClaimLimitValue,
                formula: formData.vehicleTowingFormula
            }
        },
        carCoverages: {
            personalIdentityTheft: {
                claimLimitValue: formData.personalIdentityTheftClaimLimitValue,
                formula: formData.personalIdentityTheftFormula
            },
            vehicleSoundSystem: {
                claimLimitValue: formData.vehicleSoundSystemClaimLimitValue,
                formula: formData.vehicleSoundSystemFormula
            },
        }
    };
}

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active',
        }
        if (req.query.kind && Number(req.query.kind) !== 0) {
            filter.kind = req.query.kind;
        }
        if (req.query.insurer && Number(req.query.insurer) !== 0) {
            filter.insurerId = req.query.insurer;
        }
        if (req.query.name && Number(req.query.name) !== 0) {
            filter.insurerId = req.query.name;
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{name: regex}, ]
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
            populate: ['insurerId']
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'oldest':
                options.sort = {createdAt: 1}
                break;
            case 'nameAsc':
                options.sort = {name: 1}
                break;
            case 'nameDesc':
                options.sort = {name: -1}
                break;
            default:
                sort = 'newest'
                options.sort = {createdAt: -1}
        }
        let message = req.session.messagePlanSuccess;
        delete req.session.messagePlanSuccess;
        const listInsurer = await Insurer.find({status: 'Active'}).sort({name: 1})
        const result = await Plan.paginate(filter, options);;
        res.render('admin/plan/list', {
            title: 'Plans',
            listPlan: result.docs,
            listInsurer: listInsurer,
            Insurer: req.query.insurer,
            name: req.query.name,
            selectKind: req.query.kind,
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

exports.instruct = async function (req, res, next) {
    try {
        res.render('admin/plan/instruction', {
            title: 'Plan Form Instruction'
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.create = async function (req, res, next) {
    try {
        const listInsurer = await Insurer.find({status: 'Active'})
        res.render('admin/plan/form', {
            dataPlan: {},
            title: 'Create Plan',
            listInsurer: listInsurer
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.store = async function (req, res, next) {
    if (req.body.kind === 'Motorcycle') {
        delete req.body['carCoverages'];
    }
    try {
        const dataPlan = await Plan.create(parseForm(req.body))
        req.session.messagePlanSuccess = `${dataPlan.name} has been created! Details <a href="/admin/plan/update/${dataPlan._id}" class="alert-link">here</a>.`
        res.redirect('/admin/plan/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const listInsurer = await Insurer.find({status: 'Active'})
        const dataPlan = await Plan.findById(req.params.id)
        req.session.messagePlanSuccess = `${dataPlan.name} has been updated! Details <a href="/admin/plan/update/${dataPlan._id}" class="alert-link">here</a>.`
        res.render('admin/plan/form', {
            dataPlan: dataPlan,
            title: 'Update Plan',
            listInsurer: listInsurer
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}


exports.save = async function (req, res, next) {
    if (req.body.kind === 'Motorcycle') {
        req.body['carCoverages'] = undefined;
    }
    try {
        await Plan.findByIdAndUpdate(req.params.id, parseForm(req.body))
        res.redirect('/admin/plan/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataPlan = await Plan.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messagePlanSuccess = `${dataPlan.name} has been deleted!`;
        res.redirect('/admin/plan/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}