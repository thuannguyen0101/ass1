const District = require("../models/district");
const City = require('../models/city');
require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        if (req.query.type && Number(req.query.type) !== 0) {
            filter.type = req.query.type;
        }
        if (req.query.city && Number(req.query.city) !== 0) {
            filter.cityId = req.query.city;
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
            populate: 'cityId',
            collation: ({locale: 'en_US', strength: 1})
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'nameDesc':
                options.sort = {name: -1}
                break;
            default:
                sort = 'nameAsc'
                options.sort = {name: 1}
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{name: regex}, {slug: regex}, {nameWithType: regex}, {path: regex}]
        }
        let message = req.session.messageUserSuccess;
        delete req.session.messageUserSuccess;
        const listCity = await City.find({status: 'Active'}).sort({name: 1})
        const result = await District.paginate(filter, options)
        res.render('admin/district/list', {
            listCity: listCity,
            listDistrict: result.docs,
            districtCount: result.totalDocs,
            title: 'District List',
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            Type: req.query.type,
            City: req.query.city,
            pagingCounter: result.pagingCounter,
            keyword: keyword,
            sort: sort,
            message: message

        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.create = function (req, res) {
    res.render('admin/district/form', {
        listDistrict: {},
        title: 'Create New District',
        dataDistrict: {}
    });
}

exports.store = async function (req, res, next) {
    try {
        const dataDistrict = await District.create(req.body);
        req.session.messageUserSuccess = `District ${dataDistrict.name} has been created! Details <a href="/admin/district/update/${dataDistrict._id}" class="alert-link">here</a>.`
        res.redirect('/admin/district/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const dataDistrict = await District.findById(req.params.id);
        res.render('admin/district/form', {
            dataDistrict: dataDistrict,
            title: 'Update District'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        const dataDistrict = await District.findByIdAndUpdate(req.params.id, req.body)
        req.session.messageUserSuccess = `District ${dataDistrict.name} has been updated! Details <a href="/admin/district/update/${dataDistrict._id}" class="alert-link">here</a>.`
        res.redirect('/admin/district/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataDistrict = await District.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageUserSuccess = `District ${dataDistrict.name} has been deleted!`;
        res.redirect('/admin/district/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}