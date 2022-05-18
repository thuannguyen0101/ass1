const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const faqController = require('../controllers/faq-controller');

router.get('/', faqController.listFaq);


module.exports = router;