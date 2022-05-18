const Privacy = require('../models/incident');
require('mongoose-paginate-v2');

exports.listPrivacy = async function (req, res, next) {
    try {
        let filter = {
            status: 'Active'
        }
        const options = {
            limit: 12,
        };
        const listPrivacy = await Privacy.paginate(filter, options);
        res.render('privacy', {
            listPrivacy: listPrivacy,
            countPrivacy: listPrivacy.totalDocs,
            title: 'privacy'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}