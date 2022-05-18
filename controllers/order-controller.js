const orderId = require('order-id')('safecarzliberated');
const ejs = require('ejs');
const City = require('../models/city');
const District = require('../models/district');
const Ward = require('../models/ward');
const mailer = require('../mailer');
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('../payPalClient');

const Model = require('../models/model');
const Vehicle = require('../models/vehicle');
const Order = require('../models/order');

exports.create = async function (req, res, next) {
    try {
        const dataModel = await Model.findById(req.session.quote.modelId).populate('makeId');
        req.session.quote.value = (dataModel).value;
        req.session.quote.modelNameWithMake = `${dataModel.makeId.name} ${dataModel.name}`;
        const newVehicle = new Vehicle(req.session.quote);
        let newOrder = {
            orderNumber: orderId.generate(new Date()),
            userId: req.session.user._id,
            vehicle: newVehicle,
            plan: req.session.listPlan[req.params.option],
            shippingAddress: req.session.quote.shippingAddress
        }
        const dataOrder = await Order.create(newOrder);
        const populatedOrder = await Order.findById(dataOrder._id).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId');
        ejs.renderFile('views/email/order-created.ejs', {
            order: populatedOrder,
            url: req.protocol + '://' + req.get('host')
        })
            .then(content => mailer.sendMail(populatedOrder.userId.email, `Order #${populatedOrder.orderNumber} created`, content))
        delete req.session.quote;
        res.render('order-created', {
            title: 'Order Created',
            dataOrder: populatedOrder
        })
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.list = async function (req, res, next) {
    try {
        const listOrder = await Order.find({
            userId: req.session.user._id,
            status: {$ne: 'Deleted'},
        }).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId')
            .populate('vehicle.makeId')
            .populate({
            path: 'vehicle.modelId',
            populate: 'typeId'
        }).sort('-createdAt');
        res.render('order-list', {
            title: 'Order History',
            listOrder: listOrder
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.cancelOrder = async function (req, res, next) {
    try {
        const dataOrder = await Order.findById(req.params.id).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId')
            .populate('vehicle.makeId')
            .populate({
                path: 'vehicle.modelId',
                populate: 'typeId'
            }).sort('-createdAt');
        const listCity = await City.find({status: 'Active'}).sort({name: 1});
        const listDistrict  = await District.find({ cityId:dataOrder.shippingAddress.cityId._id}).sort({name: 1});
        const listWard = await Ward.find({districtId: dataOrder.shippingAddress.districtId._id}).sort({name: 1});
        if (dataOrder.status === 'Created' || dataOrder.status === 'Confirmed' ){
            res.render('cancel-order', {
                title: 'Order History',
                listCity:listCity,
                listWard:listWard,
                listDistrict:listDistrict,
                dataOrder: dataOrder
            });
        } else{
            res.status(403).render('403', {
                title: 'Forbidden'
            });
        }

    } catch (err) {
        res.status(500);
        next(err);
    }
}
exports.saveCancel = async function (req, res, next) {
    try {
        if (req.body.cancelReason === '0'){
            req.body.cancelReason = req.body.customReason
        }
        let template = 'order-canceled';
        const dataOrder = await Order.findByIdAndUpdate(req.params.id, {status: 'Canceled',cancelReason: req.body.cancelReason}).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId');
        if (template) {
            ejs.renderFile(`views/email/${template}.ejs`, {
                order: dataOrder,
                url: req.protocol + '://' + req.get('host')
            })
                .then(content => mailer.sendMail(dataOrder.userId.email, `Your order has been canceled! #${dataOrder.orderNumber} ${template}`, content))
        }
        res.redirect('/order/history');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.save = async function (req, res, next) {
    try {
        let template = 'update-shipping';
        req.body.shippingAddress = {
            name: req.body.name,
            cityId: req.body.cityId,
            districtId: req.body.districtId,
            wardId: req.body.wardId,
            street: req.body.street,
            phone: req.body.phone
        }
        const dataOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {new: true}).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId');
        if (template) {
            ejs.renderFile(`views/email/${template}.ejs`, {
                order: dataOrder,
                url: req.protocol + '://' + req.get('host')
            })
                .then(content => mailer.sendMail(dataOrder.userId.email, `Shipping address has been updated for Order #${dataOrder.orderNumber} ${template}`, content))
        }
        res.redirect('/order/history');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.updateshipping = async function (req, res, next) {
    try {

        const dataOrder = await Order.findById(req.params.id).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId')
            .populate('vehicle.makeId')
            .populate({
                path: 'vehicle.modelId',
                populate: 'typeId'
            }).sort('-createdAt');
        const listCity = await City.find({status: 'Active'}).sort({name: 1});
        const listDistrict  = await District.find({ cityId:dataOrder.shippingAddress.cityId._id}).sort({name: 1});
        const listWard = await Ward.find({districtId: dataOrder.shippingAddress.districtId._id}).sort({name: 1});
        if (dataOrder.status === 'Created' || dataOrder.status === 'Confirmed' ){
            res.render('update-shipping', {
                title: 'Order History',
                listCity:listCity,
                listWard:listWard,
                listDistrict:listDistrict,
                dataOrder: dataOrder
            });
        } else{
            res.status(403).render('403', {
                title: 'Forbidden'
            });
        }

    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.detail = async function (req, res, next) {
    try {
        const dataOrder = await Order.findById(req.params.id).populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId')
            .populate('vehicle.makeId')
            .populate({
                path: 'vehicle.modelId',
                populate: 'typeId'
            });
        if (dataOrder.userId._id.toString() !== req.session.user._id.toString()) {
            res.status(403).render('403', {
                title: 'Forbidden'
            });
        } else {
            res.render('order-details', {
                title: `Order# ${dataOrder.orderNumber}`,
                dataOrder: dataOrder
            });
        }
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.pay = async function handleRequest(req, res, next) {
    try {
        let dataOrder = await Order.findById(req.params.id);
        if (dataOrder.userId.toString() !== req.session.user._id.toString()) {
            res.status(403).render('403', {
                title: 'Forbidden'
            });
        } else {
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                application_context: {
                    brand_name: 'Safe Carz Ltd.',
                    shipping_preference: 'NO_SHIPPING'
                },
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: Math.round(dataOrder.plan.planPrice * 100) / 100,
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: Math.round(dataOrder.plan.planPrice * 100) / 100,
                            }
                        }
                    },
                    items: [
                        {
                            name: `Order# ${dataOrder.orderNumber}`,
                            description: `${dataOrder.plan.insurerId.name} ${dataOrder.plan.name} Plan`,
                            unit_amount: {
                                "currency_code": "USD",
                                "value": Math.round(dataOrder.plan.planPrice * 100) / 100,
                            },
                            quantity: 1
                        },
                    ]
                }]
            });
            let order = await payPalClient.client().execute(request);
            res.status(200).json({
                orderID: order.result.id
            });
        }
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.capture = async function (req, res, next) {
    try {
        const orderID = req.body.orderID;
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        const capture = await payPalClient.client().execute(request);
        const dataOrder = await Order.findByIdAndUpdate(req.body.id, {status: 'Paid', paidAt: new Date(), paymentMethod: 'PayPal'}, {new: true})
            .populate('userId')
            .populate('shippingAddress.cityId')
            .populate('shippingAddress.districtId')
            .populate('shippingAddress.wardId');
        if (dataOrder.userId._id.toString() !== req.session.user._id.toString()) {
            res.status(403).render('403', {
                title: 'Forbidden'
            });
        } else {
            ejs.renderFile(`views/email/order-paid.ejs`, {
                order: dataOrder,
                url: req.protocol + '://' + req.get('host')
            }).then(content => mailer.sendMail(dataOrder.userId.email, `Order #${dataOrder.orderNumber} paid`, content))
            // const captureID = capture.result.purchase_units[0].payments.captures[0].id;
            // await database.saveCaptureID(captureID);
            res.status(200).json({
                payer: capture.result.payer,
                dataOrder: dataOrder
            });
        }
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.finish = async function (req, res, next) {
    try {
        const dataOrder = await Order.findById(req.params.id);
        if (dataOrder.userId.toString() !== req.session.user._id.toString()) {
            res.status(403).render('403', {
                title: 'Forbidden'
            });
        } else {
            res.render('order-paid', {
                title: `Payment completed`,
                dataOrder: dataOrder
            });
        }
    } catch (err) {
        res.status(500);
        next(err);
    }
}