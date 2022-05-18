const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const insurerController = require('../controllers/insurer-controller');

router.get('/', insurerController.list);
router.get('/:slug', insurerController.details);

module.exports = router;