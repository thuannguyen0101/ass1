const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const privacyController = require('../controllers/privacy-controller');

router.get('/', privacyController.listPrivacy);


module.exports = router;