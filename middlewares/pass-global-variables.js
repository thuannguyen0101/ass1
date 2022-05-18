const Message = require("../models/message");
const Order = require("../models/order");
const moment = require('moment');

module.exports = async function (req, res, next) {
    let countUnreadMessage;
    let countNewOrder;
    let countPaidOrder;
    let listUnreadMessage;
    try {
        countUnreadMessage = await Message.countDocuments({
            status: 'Active',
            isRead: false
        });
        countNewOrder = await Order.countDocuments({
            status: 'Created'
        });
        countPaidOrder = await Order.countDocuments({
            status: 'Paid'
        });
        listUnreadMessage = await Message.find({status: 'Active', isRead: false}).sort('-createdAt').limit(3);
    } catch (err) {
        res.status(500);
        next(err);
    }
    res.locals.user = req.session.user;
    res.locals.unreadMessage = countUnreadMessage;
    res.locals.countNewOrder = countNewOrder;
    res.locals.countPaidOrder = countPaidOrder;
    res.locals.listUnreadMessage = listUnreadMessage;
    res.locals.moment = moment;
    next();
};