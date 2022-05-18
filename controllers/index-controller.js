const Insurer = require('../models/insurer');
require('mongoose-paginate-v2');

exports.listIndex = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        const options = {
            limit: 12,
        };
        const data = await Insurer.paginate(filter, options);
        res.render('index', {
            listInsurer: data.docs,
            countInsurer: data.totalDocs,
            title: 'Home Page'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}