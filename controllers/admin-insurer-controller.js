const Insurer = require('../models/insurer');
const City = require('../models/city');
const District = require('../models/district');
const Ward = require('../models/ward');
// //const bcrypt = require('bcrypt');

require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        if (req.query.name && req.query.name !== 0) {
            filter.name = {'$regex' : `^.*${req.query.name}.*$`, '$options' : 'i'};
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{name: regex}]
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
            populate:
                ['address.cityId',
                    'address.districtId',
                    'address.wardId'
                ]
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
        let message = req.session.messageInsurerSuccess;
        delete req.session.messageInsurerSuccess;
        const result = await Insurer.paginate(filter, options);
        console.log(result)
        res.render('admin/insurer/list', {
            title: 'Insurer List',
            listInsurer: result.docs,
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

exports.create = function (req, res) {
    res.render('admin/insurer/form', {
        dataInsurer: {},
        title: 'Create New Insurer'
    });
}

exports.store = async function (req, res, next) {
    try {
        const dataInsurer = await Insurer.create(req.body);
        req.session.messageInsurerSuccess = `${dataInsurer.name} has been created! Details <a href="/admin/insurer/update/${dataInsurer._id}" class="alert-link">here</a>.`
        res.redirect('/admin/insurer/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const dataInsurer = await Insurer.findById(req.params.id);
        res.render('admin/insurer/form', {
            dataInsurer: dataInsurer,
            title: 'Update Insurer'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        const dataInsurer = await Insurer.findByIdAndUpdate(req.params.id, req.body);
        req.session.messageInsurerSuccess = `${dataInsurer.name} has been updated! Details <a href="/admin/insurer/update/${dataInsurer._id}" class="alert-link">here</a>.`
        res.redirect('/admin/insurer/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataInsurer = await Insurer.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageInsurerSuccess = `${dataInsurer.name} has been deleted!`;
        res.redirect('/admin/insurer/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}