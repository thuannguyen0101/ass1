const checkUser = function (req, res, next) {
    const currentUser = req.session.user;
    if (currentUser) {
        next();
    } else {
        req.session.redirect = '/order' + req.url;
        res.redirect('/entry/sign-in');
    }
};

module.exports = checkUser;