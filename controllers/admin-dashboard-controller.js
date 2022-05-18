const Order = require("../models/order");
const Plan = require("../models/plan");
const User = require("../models/user");
const Message = require("../models/message");

exports.list = async function (req, res, next) {
    try {
        const countOrder = await Order.countDocuments({status: {$in: ['Created', 'Confirmed', 'Paid', 'Shipped']}});
        const countSales = (await Order.aggregate([{
            $match: {
                status: {$in: ['Created', 'Confirmed', 'Paid', 'Shipped']}
            },
        }, {
            $group: {
                _id: null,
                total: {
                    $sum: "$plan.planPrice"
                }
            }
        }]))[0].total;
        const countPlan = await Plan.countDocuments({status: 'Active'});
        const countUser = await User.countDocuments({status: 'Active'});
        const listOrder = await Order.find({status: {$ne: 'Deleted'}}).sort('-createdAt').populate('userId').limit(6);
        const listMessage = await Message.find({status: 'Active'}).sort('-createdAt').limit(5);
        res.render('admin/dashboard', {
            title: 'Dashboard',
            countOrder: countOrder,
            countSales: countSales,
            countPlan: countPlan,
            countUser: countUser,
            listOrder: listOrder,
            listMessage: listMessage
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}