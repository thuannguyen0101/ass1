const Faq = require('../models/incident');
require('mongoose-paginate-v2');

exports.listFaq = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        const options = {
            limit: 12,
        };
        const listFaq = await Faq.paginate(filter, options);
        res.render('faq', {
            listFaq: listFaq,
            countFaq: listFaq.totalDocs,
            title: 'faq'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}