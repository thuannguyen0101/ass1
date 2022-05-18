const express = require('express');
const router = express.Router();
// router.use(express.urlencoded({extended: false}));
router.use(express.json());

const quoteController = require('../controllers/quote-controller');

router.get('/', quoteController.load);
router.get('/driver', quoteController.start);
router.post('/driver', quoteController.validate('driver'), quoteController.submitDriver);
router.post('/vehicle', quoteController.validate('vehicle'), quoteController.submitVehicle);
router.post('/options', quoteController.submitOptions);
router.post('/shipping', quoteController.submitShipping);
router.post('/sign-up', quoteController.submitSignUp);

module.exports = router;