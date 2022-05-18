exports.showInfo = async function (req, res, next) {
    try {
        res.render('about-us', {
            title: 'About Safe Carz'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}

exports.showBenefits = async function (req, res, next) {
    try {
        res.render('why-safe-carz', {
            title: 'Why Safe Carz'
        });
    } catch (err) {
        res.status(500);
        next(err);
    }
}