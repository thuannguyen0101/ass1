const District = require('../models/district');
const Ward = require('../models/ward');
const Incident = require('../models/incident');

exports.getDistricts = async function (req, res) {
    try {
        const listDistrict = await District.find({
            status: 'Active',
            cityId: req.params.cityId
        }).collation({locale: 'en_US', strength: 1}).sort('name');
        res.status(201).json(listDistrict);
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

exports.getWards = async function (req, res) {
    try {
        const listWard = await Ward.find({
            status: 'Active',
            districtId: req.params.districtId
        }).collation({locale: 'en_US', strength: 1}).sort('name');
        res.status(201).json(listWard);
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

exports.getIncidents = async function (req, res) {
    try {
        const listIncident = await Incident.find({
            status: 'Active',
            type: req.params.type
        }).sort('name');
        res.status(201).json(listIncident);
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