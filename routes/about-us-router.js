const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const aboutController = require('../controllers/about-us-controller');

router.get('/', aboutController.showInfo);
router.get('/benefits', aboutController.showBenefits);

module.exports = router;