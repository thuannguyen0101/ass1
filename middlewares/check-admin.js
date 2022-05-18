const checkAdmin = function (req, res, next) {
    const currentUser = req.session.user;
    if (currentUser && currentUser.role === 2) {
        next();
    } else if (currentUser) {
        res.status(403).render('403', {
            title: 'Forbidden'
        });
    } else {
        req.session.redirect = '/admin' + req.url;
        res.redirect('/entry/sign-in');
    }
};

module.exports = checkAdmin;