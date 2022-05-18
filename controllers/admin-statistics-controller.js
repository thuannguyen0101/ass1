const Order = require("../models/order");
const moment = require('moment');
moment().format('YYYY-MM-DD');

const defaultStart = moment().set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
}).subtract(29, 'days');
const defaultEnd = moment().set({hour: 23, minute: 59, second: 59, millisecond: 999});

async function compileSales(inputStart, inputEnd) {
    let start = inputStart ? moment(inputStart) : defaultStart;
    let end = inputEnd ? moment(inputEnd) : defaultEnd;
    let stats = [
        ['Date', 'Sales']
    ];
    let loop = new Date(start);
    while (loop <= end) {
        let currentDate = new Date(loop);
        let nextDate = new Date(loop.setDate(loop.getDate() + 1));
        const sales = await Order.aggregate([{
            $match: {
                $and: [{status: {$in: ['Created', 'Confirmed', 'Paid', 'Shipped']}}, {
                    createdAt: {
                        $gte: currentDate,
                        $lt: nextDate
                    }
                }]
            },
        }, {
            $group: {
                _id: null,
                total: {
                    $sum: "$plan.planPrice"
                }
            }
        }]);
        stats.push([moment(currentDate).format('DD MMM'), sales[0] ? sales[0].total : 0]);
        loop = nextDate;
    }
    return stats;
}

async function compileQuantity(inputStart, inputEnd) {
    let start = inputStart ? moment(inputStart) : defaultStart;
    let end = inputEnd ? moment(inputEnd) : defaultEnd;
    let stats = [
        ['Date', 'Quantity']
    ];
    let loop = new Date(start);
    while (loop <= end) {
        let currentDate = new Date(loop);
        let nextDate = new Date(loop.setDate(loop.getDate() + 1));
        const quantity = await Order.aggregate([{
            $match: {
                status: {$in: ['Created', 'Confirmed', 'Paid', 'Shipped']},
                createdAt: {
                    $gte: currentDate,
                    $lt: nextDate
                }
            },
        }, {
            $count: "orderCount"
        }]);
        stats.push([moment(currentDate).format('DD MMM'), quantity[0] ? quantity[0].orderCount : 0]);
        loop = nextDate;
    }
    return stats;
}

async function compileInsurer(inputStart, inputEnd) {
    let start = inputStart ? moment(inputStart) : defaultStart;
    let end = inputEnd ? moment(inputEnd) : defaultEnd;
    let stats = [
        ['Insurer', 'Percentage']
    ];
    let totalOrder = await Order.countDocuments({
        createdAt: {
            $gte: new Date(start),
            $lt: new Date(end)
        }
    });
    const data = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(start),
                    $lt: new Date(end)
                }
            },
        }, {
            $group: {
                _id: {
                    name: '$plan.insurerId.name'
                },
                count: {$sum: 1}
            }
        }
    ]);
    data.forEach(item => {
        stats.push([item._id.name, (item.count / totalOrder * 100).toFixed(1)]);
    })
    return stats;
}

async function compileKind(inputStart, inputEnd) {
    let start = inputStart ? moment(inputStart) : defaultStart;
    let end = inputEnd ? moment(inputEnd) : defaultEnd;
    let stats = [
        ['Kind', 'Order Quantity']
    ];
    const data = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(start),
                    $lt: new Date(end)
                }
            },
        }, {
            $group: {
                _id: '$vehicle.kind',
                count: {$sum: 1}
            }
        }
    ]);
    data.forEach(item => {
        stats.push([item._id, item.count]);
    })
    return stats;
}

exports.list = async function (req, res, next) {
    try {
        let statsSales = await compileSales();
        let statsQuantity = await compileQuantity();
        let statsInsurer = await compileInsurer();
        let statsKind = await compileKind();
        res.render('admin/statistics/list', {
            title: 'Statistics',
            moment: moment,
            statsSales: statsSales,
            statsQuantity: statsQuantity,
            statsInsurer: statsInsurer,
            statsKind: statsKind
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.customSales = async function (req, res, next) {
    try {
        let stats = await compileSales(req.body.start, req.body.end);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.customQuantity = async function (req, res, next) {
    try {
        let stats = await compileQuantity(req.body.start, req.body.end);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.customInsurer = async function (req, res, next) {
    try {
        let stats = await compileInsurer(req.body.start, req.body.end);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.customKind = async function (req, res, next) {
    try {
        let stats = await compileKind(req.body.start, req.body.end);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500);
        next(err);
    }
}