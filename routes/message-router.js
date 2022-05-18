const express = require('express');
const router = express.Router();

router.use(express.json());

const messageController = require('../controllers/message-controller');

router.get('/', messageController.getForm);
router.post('/', messageController.validate(), messageController.store);

module.exports = router;