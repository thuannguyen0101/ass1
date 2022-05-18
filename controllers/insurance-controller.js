const Insurer = require('../models/insurer');
const Plan = require('../models/plan');

uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));

exports.listCar = async function (req, res, next) {
    try {
        const listInsurer = await Insurer.find({status: 'Active'});
        const listPlan = await Plan.find({status: 'Active'});
        const listCarInsurerId = uniqueArray(listPlan.filter(item => item.kind === 'Car').map(a => a.insurerId));
        const listCarInsurer = listInsurer.filter(item => listCarInsurerId.includes(item._id.toString()));
        res.render('car-insurance', {
            title: 'Car insurance',
            listCarInsurer: listCarInsurer
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.listMotorcycle = async function (req, res, next) {
    try {
        const listInsurer = await Insurer.find({status: 'Active'});
        const listPlan = await Plan.find({status: 'Active'});
        const listMotorcycleInsurerId = uniqueArray(listPlan.filter(item => item.kind === 'Motorcycle').map(a => a.insurerId));
        const listMotorcycleInsurer = listInsurer.filter(item => listMotorcycleInsurerId.includes(item._id.toString()));
        res.render('motorcycle-insurance', {
            title: 'Motorcycle insurance',
            listMotorcycleInsurer: listMotorcycleInsurer
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.introduce = async function (req, res, next) {
    try {
        res.render('auto-insurance', {
            title: 'About auto insurance'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}