const Make = require("../models/make");
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
            default:
                sort = 'newest'
                options.sort = {createdAt: -1}
        }
        let message = req.session.messageMakeSuccess;
        delete req.session.messageMakeSuccess;
        const result = await Make.paginate(filter, options);
        res.render('admin/make/list', {
            listMake: result.docs,
            title: 'Make list',
            selectKind: req.query.kind,
            makeCount: result.totalDocs,
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
        next(err)
    }
}

exports.create = function (req, res) {
    res.render('admin/make/form', {
        title: 'Create New Make',
        dataMake: {}
    });
}

function parseForm(formData) {
    return {
        name: formData.name,
        kind: formData.kind,
    }
}

exports.store = async function (req, res, next) {
    try {
        const dataMake = await Make.create(parseForm(req.body))
        req.session.messageMakeSuccess = `Make ${dataMake.name} ${dataMake.kind} has been created! Details <a href="/admin/make/update/${dataMake._id}" class="alert-link">here</a>.`
        res.redirect('/admin/make/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.update = async function (req, res, next) {
    try {
        const dataMake = await Make.findById(req.params.id);
        res.render('admin/make/form', {
            dataMake: dataMake,
            title: 'Update Make'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        const dataMake = await Make.findByIdAndUpdate(req.params.id, req.body)
        req.session.messageMakeSuccess = `Make ${dataMake.name} ${dataMake.kind} has been updated! Details <a href="/admin/make/update/${dataMake._id}" class="alert-link">here</a>.`
        res.redirect('/admin/make/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataMake = await Make.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageMakeSuccess = `Make ${dataMake.name} has been deleted!`;
        res.redirect('/admin/make/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}