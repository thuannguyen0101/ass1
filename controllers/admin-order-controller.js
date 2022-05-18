const ejs = require('ejs');
const mailer = require('../mailer');

const Order = require('../models/order');
const City = require('../models/city');
const Type = require("../models/type");
const Make = require("../models/make");
const District = require('../models/district');
const Ward = require('../models/ward');
const Insurer = require('../models/insurer');
const Vehicle = require('../models/vehicle');

exports.list = async function (req, res, next) {
    try {
        const listInsurer = await Insurer.find({status: 'Active'})
        let filter = {
            status: {$ne: 'Deleted'},
        }
        if (req.query.insurer && Number(req.query.insurer) !== 0) {
            filter['plan.insurerId._id'] = req.query.insurer;
        }
        if (req.query.paymentMethod && Number(req.query.paymentMethod) !== 0) {
            filter.paymentMethod = req.query.paymentMethod;
        }
        if (req.query.status && Number(req.query.status) !== 0) {
            filter.status = req.query.status;
        }
        const options = {
            page: req.query.page ? req.query.page : 1,
            limit: req.query.limit ? req.query.limit : 50,
            populate: ['userId'],
            collation: ({locale: 'en_US', strength: 1})
        };
        let sort = req.query.sort;
        switch (sort) {
            case 'highest':
                options.sort = {"plan.planPrice": -1}
                break;
            case 'lowest':
                options.sort = {"plan.planPrice": 1}
                break;
            case 'oldest':
                options.sort = {createdAt: 1}
                break;
            default:
                sort = 'newest'
                options.sort = {createdAt: -1}
        }
        let keyword = req.query.keyword;
        if (keyword && keyword.length) {
            let regex = new RegExp(`^.*${keyword}.*$`, 'i');
            filter['$or'] = [{orderNumber: regex} ,{'shippingAddress.name':regex},{'shippingAddress.phone':regex}]
        }
        const result = await Order.paginate(filter, options);
        let message = req.session.messageOrderSuccess;
        delete req.session.messageOrderSuccess;
        res.render('admin/order/list', {
            listOrder: result.docs,
            title: 'Order List',
            message: message,
            listInsurer: listInsurer,
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
            pagingCounter: result.pagingCounter,
            count: result.totalDocs,
            sort: sort,
            keyword: keyword,
            status: req.query.status,
            insurer: req.query.insurer,
            paymentMethod: req.query.paymentMethod,
        });
    } catch (err) {
        res.status(500);
        next(err)
    }
}

exports.update = async function (req, res, next) {
    try {
        const listType = await Type.find({status: 'Active'})
        const listMake = await Make.find({status: 'Active'})
        const listCity = await City.find({status: 'Active'}).collation({locale: 'en_US', strength: 1}).sort('name');
        const dataOrder = await Order.findById(req.params.id).populate({
            path: 'userId',
            populate: 'address.wardId'
        }).populate({
            path: 'shippingAddress',
            populate: 'wardId'
        }).populate({path: 'vehicle.makeId'}).populate({path: 'vehicle.modelId'});
        let listDistrict, listWard;
        if (dataOrder.shippingAddress) {
            listDistrict = await District.find({cityId: dataOrder.shippingAddress.cityId, status: 'Active'});
            listWard = await Ward.find({districtId: dataOrder.shippingAddress.districtId, status: 'Active'});
        }
        res.render('admin/order/form', {
            title: `Update Order # ${dataOrder.orderNumber}`,
            dataOrder: dataOrder,
            listCity: listCity,
            listDistrict: listDistrict,
            listWard: listWard,
            listMake: listMake,
            listType: listType
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}


exports.save = async function (req, res, next) {
    try {
        const dataVehicle = new Vehicle(req.body);
        req.body.shippingAddress = {
            name: req.body.name,
            cityId: req.body.cityId,
            districtId: req.body.districtId,
            wardId: req.body.wardId,
            street: req.body.street,
            phone: req.body.phone
        }
        req.body.vehicle = dataVehicle

        const oldStatus = (await Order.findById(req.params.id)).status;
        let template;
        if (oldStatus !== req.body.status) {
            switch (req.body.status) {
                case 'Created':
                    req.body.confirmedAt = undefined;
                    req.body.paidAt = undefined;
                    req.body.shippedAt = undefined;
                    req.body.paymentMethod = undefined;
                    break;
                case 'Confirmed':
                    req.body.confirmedAt = new Date();
                    req.body.paidAt = undefined;
                    req.body.shippedAt = undefined;
                    req.body.paymentMethod = undefined;
                    template = 'confirmed'
                    break;
                case 'Paid':
                    req.body.paidAt = new Date();
                    req.body.shippedAt = undefined;
                    template = 'paid';
                    if (oldStatus === 'Created') {
                        req.body.confirmedAt = new Date();
                    }
                    break;
                case 'Shipped':
                    req.body.shippedAt = new Date();
                    template = 'shipped';
                    if (oldStatus === 'Created') {
                        req.body.confirmedAt = new Date();
                        req.body.paidAt = new Date();
                    } else if (oldStatus === 'Confirmed') {
                        req.body.paidAt = new Date();
                    }
                    break;
                case 'Canceled':
                    req.body.canceledAt = new Date();
                    template = 'canceled';
                    break;
            }
        }
        const dataOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {new: true}).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId');
        if (template) {
            ejs.renderFile(`views/email/order-${template}.ejs`, {
                order: dataOrder,
                url: req.protocol + '://' + req.get('host')
            })
                .then(content => mailer.sendMail(dataOrder.userId.email, `Order #${dataOrder.orderNumber} ${template}`, content))
        }
        req.session.messageOrderSuccess = `Order # ${dataOrder.orderNumber} has been updated! Details <a href="/admin/order/update/${dataOrder._id}" class="alert-link">here</a>.`
        res.redirect('/admin/order/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}


exports.delete = async function (req, res, next) {
    try {
        const dataOrder = await Order.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageOrderSuccess = `Order # ${dataOrder.orderNumber} has been deleted!`;
        res.redirect('/admin/order/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}