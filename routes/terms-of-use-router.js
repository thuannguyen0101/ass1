const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const termController = require('../controllers/terms-of-use-controller');

router.get('/', termController.listTerm);


module.exports = router;