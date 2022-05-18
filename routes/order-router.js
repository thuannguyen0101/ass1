const express = require('express');
const router = express.Router();

router.use(express.json());

const orderController = require('../controllers/order-controller');

router.get('/create/:option', orderController.create);
router.get('/history', orderController.list);
router.get('/detail/:id', orderController.detail);
router.post('/pay/:id', orderController.pay);
router.post('/capture/:id', orderController.capture);
router.get('/pay/:id', orderController.finish);
router.get('/update-shipping/:id', orderController.updateshipping);
router.post('/update-shipping/:id', orderController.save);

router.get('/cancel/:id', orderController.cancelOrder);
router.post('/cancel/:id', orderController.saveCancel);

module.exports = router;