const Term = require('../models/incident');
require('mongoose-paginate-v2');

exports.listTerm= async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        const options = {
            limit: 12,
        };
        const listTerm = await Term.paginate(filter, options);
        res.render('terms-of-use', {
            listTerm: listTerm,
            countTerm: listTerm.totalDocs,
            title: 'terms-of-use'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}