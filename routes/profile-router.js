const express = require('express');
const router = express.Router();

router.use(express.json());

const profileController = require('../controllers/profile-controllers');

router.get('/', profileController.list);
router.get('/update-my-profile/:id', profileController.update);
router.post('/update-my-profile/:id', profileController.save);


module.exports = router;