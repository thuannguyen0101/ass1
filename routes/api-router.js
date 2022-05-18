const express = require('express');
const router = express.Router();

router.use(express.json());

const apiController = require('../controllers/api-controller');

router.get('/district/:cityId', apiController.getDistricts);
router.get('/ward/:districtId', apiController.getWards);
router.get('/incident/:type', apiController.getIncidents);

module.exports = router;