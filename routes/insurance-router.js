const express = require('express');
const router = express.Router();
router.use(express.urlencoded({extended: false}));

const insuranceController = require('../controllers/insurance-controller');

router.get('/', insuranceController.introduce);
router.get('/car', insuranceController.listCar);
router.get('/motorcycle', insuranceController.listMotorcycle);

module.exports = router;