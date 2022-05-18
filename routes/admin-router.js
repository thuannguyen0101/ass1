const express = require('express');
const router = express.Router();

router.use(express.urlencoded({extended: false}));
router.use(express.json());

const dashboardController = require('../controllers/admin-dashboard-controller');
const userController = require('../controllers/admin-user-controller');
const insurerController = require('../controllers/admin-insurer-controller');
const planController = require('../controllers/admin-plan-controller');
const makeController = require('../controllers/admin-make-controller');
const typeController = require('../controllers/admin-type-controller');
const modelController = require('../controllers/admin-model-controller');
const cityController = require('../controllers/admin-city-controller');
const districtController = require('../controllers/admin-district-controller');
const wardController = require('../controllers/admin-ward-controller');
const incidentController = require('../controllers/admin-incident-controller');
const orderController = require('../controllers/admin-order-controller');
const messageController = require('../controllers/admin-message-controller');
const statisticsController = require('../controllers/admin-statistics-controller');

router.get('/', dashboardController.list);

router.get('/message/list', messageController.list);
router.get('/message/list/trash', messageController.listDeleted);
router.post('/message/update-many', messageController.updateMany);
router.get('/message/read/:id', messageController.read);
router.get('/message/delete/:id', messageController.delete);
router.get('/message/toggle-star/:id', messageController.toggleStar);
router.get('/message/compose', messageController.compose);
router.get('/message/reply/:id', messageController.reply);
router.get('/message/forward/:id', messageController.forward);
router.post('/message/compose', messageController.send);

router.get('/user/list', userController.list);
router.get('/user/create', userController.create);
router.post('/user/create', userController.store);
router.get('/user/update/:id', userController.update);
router.post('/user/update/:id', userController.save);
router.get('/user/delete/:id', userController.delete);

router.get('/insurer/list', insurerController.list);
router.get('/insurer/create', insurerController.create);
router.post('/insurer/create', insurerController.store);
router.get('/insurer/update/:id', insurerController.update);
router.post('/insurer/update/:id', insurerController.save);
router.get('/insurer/delete/:id', insurerController.delete);

router.get('/plan/list', planController.list);
router.get('/plan/create', planController.create);
router.post('/plan/create', planController.store);
router.get('/plan/update/:id', planController.update);
router.post('/plan/update/:id', planController.save);
router.get('/plan/delete/:id', planController.delete);
router.get('/plan/instruction', planController.instruct);

router.get('/make/list', makeController.list);
router.get('/make/create', makeController.create);
router.post('/make/create', makeController.store);
router.get('/make/update/:id', makeController.update);
router.post('/make/update/:id', makeController.save);
router.get('/make/delete/:id', makeController.delete);

router.get('/type/list', typeController.list);
router.get('/type/create', typeController.create);
router.post('/type/create', typeController.store);
router.get('/type/update/:id', typeController.update);
router.post('/type/update/:id', typeController.save);
router.get('/type/delete/:id', typeController.delete);

router.get('/model/list', modelController.list);
router.get('/model/create', modelController.create);
router.post('/model/create', modelController.store);
router.get('/model/update/:id', modelController.update);
router.post('/model/update/:id', modelController.save);
router.get('/model/delete/:id', modelController.delete);

router.get('/city/list', cityController.list);
router.get('/city/create', cityController.create);
router.post('/city/create', cityController.store);
router.get('/city/update/:id', cityController.update);
router.post('/city/update/:id', cityController.save);
router.get('/city/delete/:id', cityController.delete);

router.get('/district/list', districtController.list);
router.get('/district/create', districtController.create);
router.post('/district/create', districtController.store);
router.get('/district/update/:id', districtController.update);
router.post('/district/update/:id', districtController.save);
router.get('/district/delete/:id', districtController.delete);

router.get('/ward/list', wardController.list);
router.get('/ward/create', wardController.create);
router.post('/ward/create', wardController.store);
router.get('/ward/update/:id', wardController.update);
router.post('/ward/update/:id', wardController.save);
router.get('/ward/delete/:id', wardController.delete);

router.get('/incident/list', incidentController.list);
router.get('/incident/create', incidentController.create);
router.post('/incident/create', incidentController.store);
router.get('/incident/update/:id', incidentController.update);
router.post('/incident/update/:id', incidentController.save);
router.get('/incident/delete/:id', incidentController.delete);

router.get('/order/list', orderController.list);
router.get('/order/update/:id', orderController.update);
router.post('/order/update/:id', orderController.save);
router.get('/order/delete/:id', orderController.delete);

router.get('/statistics', statisticsController.list);
router.post('/statistics/sales', statisticsController.customSales);
router.post('/statistics/quantity', statisticsController.customQuantity);
router.post('/statistics/insurer', statisticsController.customInsurer);
router.post('/statistics/kind', statisticsController.customKind);

module.exports = router;