const Type = require("../models/type");
const bcrypt = require('bcrypt');
require('mongoose-paginate-v2');

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        if (req.query.kind && Number(req.query.kind) !== 0) {
            filter.kind = req.query.kind;
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{name: regex}, {kind: regex}]
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
            case 'oldest':
                options.sort = {createdAt: -1}
                break;
            default:
                sort = 'newest'
                options.sort = {createdAt: 1}
        }
        let message = req.session.messageTypeSuccess;
        delete req.session.messageTypeSuccess;
        const result = await Type.paginate(filter, options);
        res.render('admin/type/list', {
            listType: result.docs,
            title: 'Type List',
            selectKind: req.query.kind,
            typeCount: result.totalDocs,
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            pagingCounter: result.pagingCounter,
            kind: req.query.role,
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
    res.render('admin/type/form', {
        title: 'Create New Type',
        dataType: {}
    });
}

function parseForm(formData) {
    return {
        name: formData.name,
        photo: formData.photo,
        kind: formData.kind,
    }
}

exports.store = async function (req, res, next) {
    try {
        const dataType = await Type.create(parseForm(req.body))
        req.session.messageTypeSuccess = `Type ${dataType.name} has been created! Details <a href="/admin/type/update/${dataType._id}" class="alert-link">here</a>.`
        res.redirect('/admin/type/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const dataType = await Type.findById(req.params.id)
        res.render('admin/type/form', {
            dataType: dataType,
            title: 'Update Type'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        const dataType = await Type.findByIdAndUpdate(req.params.id, req.body)
        req.session.messageTypeSuccess = `Type ${dataType.name} has been updated! Details <a href="/admin/type/update/${dataType._id}" class="alert-link">here</a>.`
        res.redirect('/admin/type/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const datType = await Type.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messagetypeSuccess = `Type ${datType.name} has been deleted!`;
        res.redirect('/admin/type/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}