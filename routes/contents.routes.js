const express = require('express');
const router = express.Router();
const contentsController = require('../controllers/contents.controller');
const { checkSession, checkRol } = require('../middlewares/security.middleware');

router.post('/create', checkSession, checkRol(['CREATOR', 'ADMIN']), contentsController.createContent);
router.post('/update', checkSession, checkRol(['CREATOR', 'ADMIN']), contentsController.updateContent);
router.post('/get-by-id', checkSession, contentsController.getById);
router.post('/list', contentsController.getList);
router.post('/delete', checkSession, checkRol(['CREATOR', 'ADMIN']), contentsController.deleteContent);

module.exports = router;
