const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));
router.use(express.json());

const controller = require('../controllers/entry-controller');

router.get('/sign-in', controller.signIn);
router.post('/sign-in', controller.processSignIn);
router.get('/sign-out',controller.signOut);
router.get('/sign-up', controller.signUp);
router.post('/sign-up', controller.processSignUp);

module.exports = router;