const City = require("../models/city");
const Message = require("../models/message");
const {check, validationResult} = require('express-validator');

exports.validate = function () {
    return [
        check('subject', 'Subject is required').isIn(Object.values(Message.Subject)),
        check('title', 'Title is required').not().isEmpty(),
        check('fullName', 'Full name is required').not().isEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('phone', 'Invalid phone').isLength({min: 8, max: 15}),
        check('cityId', 'City is required').not().isEmpty(),
        check('comment', 'Comment is required').not().isEmpty(),
    ]
}

exports.getForm = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        const listCity = await City.find(filter);
        res.render('contact-us', {
            title: 'Contact Us',
            listCity: listCity,
            listSubject: Message.Subject
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.store = async function (req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const newMessage = await Message.create(req.body);
        res.status('201').json(newMessage);
    } else {
        console.log(errors);
        res.status(400).json(errors);
    }
}