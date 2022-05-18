const Model = require('../models/model');
const Type = require("../models/type");
const Make = require("../models/make");
require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active',
        }
        if (req.query.kind && Number(req.query.kind) !== 0) {
            filter.kind = req.query.kind;
        }
        if (req.query.year && Number(req.query.year) !== 0) {
            filter.year = req.query.year;
        }
        if (req.query.type && Number(req.query.type) !== 0) {
            filter.typeId = req.query.type;
        }
        if (req.query.make && Number(req.query.make) !== 0) {
            filter.makeId = req.query.make;
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
            populate: ['makeId', 'typeId'],
            collation:({locale: 'en_US', strength: 1})
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'nameAsc':
                options.sort = {name: 1}
                break;
            case 'highest':
                options.sort = {value: -1}
                break;
            case 'lowest':
                options.sort = {value: 1}
                break;
            case 'yearAsc':
                options.sort = {year: 1}
                break;
            case 'yearDesc':
                options.sort = {year: -1}
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

        const listType = await Type.find({status: 'Active'}).sort({name: 1})
        const listMake = await Make.find({status: 'Active'}).sort({name: 1})
        const result = await Model.paginate(filter, options);
        res.render('admin/model/list', {
            listModel: result.docs,
            listType:listType,
            listMake:listMake,
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            pagingCounter: result.pagingCounter,
            modelCount: result.totalDocs,
            title: 'Model',
            kind: req.query.kind,
            sort:sort,
            keyword: keyword,
            year:req.query.year,
            type:req.query.type,
            make:req.query.make,
            message: message

        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.create = async function (req, res) {
    const listMake = await Make.find({status: 'Active'})
    const listType = await Type.find({status: 'Active'})
    res.render('admin/model/form', {
        listMake: listMake,
        listType: listType,
        listStatus: Model.Status,
        dataModel: {},
        title: 'Create Model'
    })
}

exports.update = async function (req, res, next) {
    const listMake = await Make.find({status: 'Active'});
    const listType = await Type.find({status: 'Active'});
    const dataModel = await Model.findById(req.params.id);
    try {
        res.render('admin/model/form', {
            listMake: listMake,
            listType: listType,
            dataModel: dataModel,
            title: 'Update Model'
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        const dataModel = await Model.findByIdAndUpdate(req.params.id, req.body);
        req.session.messageUserSuccess = `Model ${dataModel.name} has been updated! Details <a href="/admin/model/update/${dataModel._id}" class="alert-link">here</a>.`
        res.redirect('/admin/model/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.store = async function (req, res, next) {
    try {
        const dataModel =  await Model.create(req.body)
        req.session.messageUserSuccess = `Model ${dataModel.name} has been created! Details <a href="/admin/model/update/${dataModel._id}" class="alert-link">here</a>.`
        res.redirect('/admin/model/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataModel = await Model.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageUserSuccess = `Model ${dataModel.name} has been deleted!`;
        res.redirect('/admin/model/list')
    } catch (err) {
        res.status(500);
        next(err);
    }

}