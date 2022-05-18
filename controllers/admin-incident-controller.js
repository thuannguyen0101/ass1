const Incident = require('../models/incident');
const bcrypt = require('bcrypt');
require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        if (req.query.type && Number(req.query.type) !== 0) {
            filter.type = req.query.type;
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{name: regex}, {type: regex}]
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'nameAsc':
                options.sort = {name: 1}
                break;
            case 'nameDesc':
                options.sort = {name: -1}
                break;
            default:
                sort = 'nameAsc'
                options.sort = {createdAt: 1}
        }
        let message = req.session.messageIncidentSuccess;
        delete req.session.messageIncidentSuccess;
        const result = await Incident.paginate(filter, options);
        const listIncident = await Incident.find(filter);
        res.render('admin/incident/list', {
            title: 'Incident List',
            listIncident: result.docs,
            incidentCount: result.totalDocs,
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            pagingCounter: result.pagingCounter,
            Type: req.query.type,
            keyword: keyword,
            sort: sort,
            message: message
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.create = function (req, res) {
    res.render('admin/incident/form', {
        listIncident: {},
        title: 'Create New Incident',
        dataIncident: {}
    });
}

exports.store = async function (req, res, next) {
    try {
        const dataIncident = await Incident.create(req.body);
        req.session.messageIncidentSuccess = `Incident ${dataIncident.name} has been created! Details <a href="/admin/incident/update/${dataIncident._id}" class="alert-link">here</a>.`
        res.redirect('/admin/incident/list');
    } catch (err) {
            res.status(500);
            next(err);
        }
}

exports.update = async function (req, res, next) {
    try {
        const dataIncident = await Incident.findById(req.params.id);
        res.render('admin/incident/form', {
            dataIncident: dataIncident,
            title: 'Update Incident'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        const dataIncident = await Incident.findByIdAndUpdate(req.params.id, req.body)
        req.session.messageIncidentSuccess = `Incident ${dataIncident.name} has been updated! Details <a href="/admin/incident/update/${dataIncident._id}" class="alert-link">here</a>.`
        res.redirect('/admin/incident/list');
    } catch (err) {
            res.status(500);
            next(err);
        }
}


exports.delete = async function (req, res, next) {
    try {
        const dataIncident = await Incident.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageIncidentSuccess = `Incident ${dataIncident.name} has been deleted!`;
        res.redirect('/admin/incident/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}