const City = require("../models/city");
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
            filter['$or'] = [{name: regex}, {slug: regex}, {type: regex}, {newWithType: regex}, {code: regex}]
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
        let message = req.session.messageCitySuccess;
        delete req.session.messageCitySuccess;
        const result = await City.paginate(filter, options);
        const listCity = await City.find(filter);
        res.render('admin/city/list', {
            title: 'City List',
            listCity: result.docs,
            cityCount: result.totalDocs,
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
    res.render('admin/city/form', {
        listCity: {},
        title: 'Create New City',
        dataCity: {}
    });
}

exports.store = async function (req, res, next) {
    try {
        console.log(req.body)
        await City.create(req.body);
        res.redirect('/admin/city/list');
    } catch (err) {
        res.status(500);
        next(err);
    }

}

exports.update = async function (req, res, next) {
    try {
        const dataCity = await City.findById(req.params.id);
        res.render('admin/city/form', {
            dataCity: dataCity,
            title: 'Update City'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res) {
    try {
        const dataCity = await City.findByIdAndUpdate(req.params.id, req.body, {runValidators: true, context: 'query'});
        req.session.messageCitySuccess = `City ${dataCity.name} has been updated! Details <a href="/admin/city/update/${dataCity._id}" class="alert-link">here</a>.`
        await City.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin/city/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataCity = await City.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
        });
        req.session.messageCitySuccess = `City ${dataCity.name} has been deleted!```;
        res.redirect('/admin/city/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}