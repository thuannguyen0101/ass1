const Insurer = require('../models/insurer');
const Plan = require('../models/plan');

exports.list = async function (req, res, next) {
    try {
        uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
        const listInsurer = await Insurer.find({status: 'Active'});
        const listPlan = await Plan.find({status: 'Active'});
        const listCarInsurerId = uniqueArray(listPlan.filter(item => item.kind === 'Car').map(a => a.insurerId));
        const listMotorcycleInsurerId = uniqueArray(listPlan.filter(item => item.kind === 'Motorcycle').map(a => a.insurerId));
        const listCarInsurer = listInsurer.filter(item => listCarInsurerId.includes(item._id.toString()));
        const listMotorcycleInsurer = listInsurer.filter(item => listMotorcycleInsurerId.includes(item._id.toString()));
        res.render('insurers', {
            listInsurer: listInsurer,
            title: 'Insurers',
            listCarInsurer: listCarInsurer,
            listMotorcycleInsurer: listMotorcycleInsurer
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}
exports.details = async function (req, res,next) {
    try {
        const dataInsurer = await Insurer.findOne({slug: req.params.slug});
        const listPlan = await Plan.find({status: 'Active', insurerId: dataInsurer._id}).sort('mainCoverages.liabilityBody.claimLimitValue');
        const listCarPlan = listPlan.filter(item => item.kind === 'Car');
        const listMotorcyclePlan = listPlan.filter(item => item.kind === 'Motorcycle');
        res.render('insurer-details', {
            listCarPlan: listCarPlan,
            listMotorcyclePlan: listMotorcyclePlan,
            dataInsurer: dataInsurer,
            title: 'Insurance Details'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}
