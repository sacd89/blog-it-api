const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const { checkSession, checkRol } = require('../middlewares/security.middleware');

router.post('/create', checkSession, checkRol(['ADMIN']), categoriesController.createCategory);
router.post('/update', checkSession, checkRol(['ADMIN']), categoriesController.updateCategory);
router.post('/get-by-id', checkSession, categoriesController.getById);
router.post('/list', checkSession, checkRol(['ADMIN']), categoriesController.getList);
router.post('/delete', checkSession, checkRol(['ADMIN']), categoriesController.deleteCategory);

module.exports = router;
