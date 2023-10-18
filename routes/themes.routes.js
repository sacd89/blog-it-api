const express = require('express');
const router = express.Router();
const themesController = require('../controllers/themes.controller');
const { checkSession, checkRol } = require('../middlewares/security.middleware');

router.post('/create', checkSession, checkRol(['ADMIN']), themesController.createTheme);
router.post('/update', checkSession, checkRol(['ADMIN']), themesController.updateTheme);
router.post('/get-by-id', checkSession, themesController.getById);
router.post('/list', checkSession, themesController.getList);
router.post('/delete', checkSession, checkRol(['ADMIN']), themesController.deleteTheme);

module.exports = router;
