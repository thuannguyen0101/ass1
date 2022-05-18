const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const indexController = require('../controllers/index-controller');

router.get('/', indexController.listIndex);


module.exports = router;