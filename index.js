const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Chinh sua

const checkAdminMiddleware = require('./middlewares/check-admin');
const checkUserMiddleware = require('./middlewares/check-user');
const passVariableMiddlewares = require('./middlewares/pass-global-variables');

mongoose.connect('mongodb+srv://quando213:doducquan@cluster0.ana9j.mongodb.net/safecarz?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).catch(error => console.log(error));

const session = require('express-session');
app.use(session({
    secret: 'safecarzthesupersecretcode',
    resave: true,
    saveUninitialized: true
}));

const adminRouter = require('./routes/admin-router');
const indexRouter = require('./routes/index-router');
const aboutUsRouter = require('./routes/about-us-router');
const insurerRouter = require('./routes/insurer-router');
const messageRouter = require('./routes/message-router');
const quoteRouter = require('./routes/quote-router');
const orderRouter = require('./routes/order-router');
const entryRouter = require('./routes/entry-router');
const apiRouter = require('./routes/api-router');
const profileRouter = require('./routes/profile-router');
const insuranceRouter = require('./routes/insurance-router');
const faqRouter = require('./routes/faq-router');
const privacyRouter = require('./routes/privacy-router');
const termsRouter = require('./routes/terms-of-use-router');

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(passVariableMiddlewares);
app.use('/admin', checkAdminMiddleware);
app.use('/order', checkUserMiddleware);

app.use('/admin', adminRouter);
app.use('/', indexRouter);
app.use('/insurer', insurerRouter);
app.use('/quote', quoteRouter);
app.use('/order', orderRouter);
app.use('/entry', entryRouter);
app.use('/api', apiRouter);
app.use('/my-profile', profileRouter);
app.use('/contact-us', messageRouter);
app.use('/insurance', insuranceRouter);
app.use('/about-us', aboutUsRouter);
app.use('/faq', faqRouter);
app.use('/privacy', privacyRouter);
app.use('/terms-of-use', termsRouter);

app.use(function errorHandler(err, req, res, next) {
    console.log(err);
    res.render('500', {
        title: 'Internal Server Error'
    });
});

app.get('*', function (req, res) {
    res.render('404', {
        title: 'Page Not Found'
    });
});

app.listen(process.env.PORT || 8888, function () {
    console.log('App running: http://localhost:8888');
})