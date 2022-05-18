const Ward = require("../models/ward");
const City = require('../models/city');
const District = require('../models/district');
require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active',
        }
        if (req.query.cityId && Number(req.query.cityId) !== 0) {
            filter.cityId = req.query.cityId.toString();
        }
        if (req.query.type && Number(req.query.type) !== 0) {
            filter.type = req.query.type;
        }
        if (req.query.districtId && Number(req.query.districtId) !== 0) {
            filter.districtId = req.query.districtId.toString();
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
            populate:
                ['cityId',
                    'districtId',
                ],
            collation:({locale: 'en_US', strength: 1})
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'nameAsc':
                options.sort = {name: 1}
                break;
            case 'nameDesc':
                options.sort = {name: -1}
                break;
            case 'oldest':
                options.sort = {createdAt: -1}
                break;
            default:
                sort = 'newest'
                options.sort = {createdAt: 1}
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{name: regex}]
        }
        let message = req.session.messageUserSuccess;
        delete req.session.messageUserSuccess;
        let listDistrict = []
        if (req.query.cityId && Number(req.query.cityId) !== 0){
             listDistrict = await District.find({cityId: req.query.cityId, status: 'Active'});
        }

        const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
        const result = await Ward.paginate(filter,options)
        res.render('admin/ward/list', {
            listWard: result.docs,
            listCity:listCity,
            title: 'Ward List',
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            pagingCounter: result.pagingCounter,
            keyword: keyword,
            message: message,
            sort:sort,
            wardCount: result.totalDocs,
            cityId:req.query.cityId,
            districtId:req.query.districtId,
            listDistrict:listDistrict
        });
    } catch (err) {
        res.status(500);
        next(err)
    }
}
exports.start = async function (req, res) {
    try {
        const [listCity, listDistrict] = await Promise.all([
            City.find({status: 'Active'}),
            District.find({status: 'Active'}),
        ]);
        res.status(201).json({
            listCity: listCity.sort((a, b) => a.name.localeCompare(b.name, 'en', {'sensitivity': 'base'})),
            listDistrict: listDistrict,
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



exports.create = function (req, res) {
    res.render('admin/ward/form', {
        listWard: {},
        title: 'Create New Ward',
        dataWard: {}
    });
}

exports.store = async function (req, res, next) {
    try {
        const dataWard =  await Ward.create(req.body);
        req.session.messageUserSuccess = `Ward ${dataWard.name} has been created! Details <a href="/admin/ward/update/${dataWard._id}" class="alert-link">here</a>.`
        res.redirect('/admin/ward/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const dataWard = await Ward.findById(req.params.id);
        res.render('admin/ward/form', {
            dataWard: dataWard,
            title: 'Update Ward'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res) {
    try {
        const dataWard = await Ward.findByIdAndUpdate(req.params.id, req.body)
        req.session.messageUserSuccess = `Ward ${dataWard.name} has been updated! Details <a href="/admin/Ward/update/${dataWard._id}" class="alert-link">here</a>.`
        res.redirect('/admin/ward/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataWard = await Ward.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageUserSuccess = `Ward ${dataWard.name} has been deleted!`;
        res.redirect('/admin/ward/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}