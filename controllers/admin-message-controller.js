const moment = require('moment');
const ejs = require('ejs');
const mailer = require('../mailer');
const Message = require("../models/message");

exports.list = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        if (req.query.isRead) {
            filter.isRead = req.query.isRead;
        }
        if (req.query.isStarred) {
            filter.isStarred = req.query.isStarred;
        }
        let message = req.session.messageMessageSuccess;
        delete req.session.messageMessageSuccess;
        const listMessage = await Message.find(filter).sort('-createdAt');
        res.render('admin/message/list', {
            listMessage: listMessage,
            title: 'Inbox',
            message: message,
            moment: moment
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.listDeleted = async function (req, res, next) {
    try {
        let filter = {
            status: 'Deleted'
        }
        let message = req.session.messageMessageSuccess;
        delete req.session.messageMessageSuccess;
        const listMessage = await Message.find(filter).sort('-createdAt');
        res.render('admin/message/list', {
            listMessage: listMessage,
            title: 'Trash',
            message: message,
            moment: moment
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.updateMany = async function (req, res) {
    try {
        let updateObj = {};
        switch (req.body.action) {
            case 'delete':
                updateObj.status = 'Deleted';
                break;
            case 'restore':
                updateObj.status = 'Active';
                break;
            case 'unread':
                updateObj.isRead = false;
                break;
            case 'read':
                updateObj.isRead = true;
                break;
            case 'star':
                updateObj.isStarred = true;
        }
        const listMessage = await Message.updateMany({
            _id: {$in: req.body.id}
        }, updateObj);
        res.status(201).json(listMessage);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.read = async function (req, res, next) {
    try {
        const dataMessage = await Message.findByIdAndUpdate(req.params.id, {isRead: true}, {new: true}).populate('cityId');
        res.render('admin/message/read', {
            dataMessage: dataMessage,
            title: 'Message'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    try {
        const dataMessage = await Message.findByIdAndUpdate(req.params.id, {
            status: 'Deleted',
            deletedAt: new Date()
        });
        req.session.messageMessageSuccess = `Message ${dataMessage.title} has been deleted!`;
        res.redirect('/admin/message/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.toggleStar = async function (req, res, next) {
    try {
        const dataMessage = await Message.findById(req.params.id);
        dataMessage.isStarred = !dataMessage.isStarred;
        await dataMessage.save();
        res.status(201).json(dataMessage);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.compose = async function (req, res, next) {
    try {
        res.render('admin/message/compose', {
            dataMessage: {},
            title: 'Compose',
            composeType: 'new'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.reply = async function (req, res, next) {
    try {
        const dataMessage = await Message.findById(req.params.id).populate('cityId').exec();
        res.render('admin/message/compose', {
            dataMessage: dataMessage,
            title: 'Reply Message',
            composeType: 'reply'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.forward = async function (req, res, next) {
    try {
        const dataMessage = await Message.findById(req.params.id).populate('cityId').exec();
        res.render('admin/message/compose', {
            dataMessage: dataMessage,
            title: 'Forward Message',
            composeType: 'forward'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.send = async function (req, res, next) {
    try {
        mailer.sendMail(req.body.to, req.body.subject, req.body.content);
        req.session.messageMessageSuccess = `Message sent!`;
        res.redirect('/admin/message/list');
    } catch (err) {
        res.status(500);
        next(err);
    }
}