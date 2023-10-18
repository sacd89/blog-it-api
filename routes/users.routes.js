const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { checkSession, checkRol } = require('../middlewares/security.middleware');

/* GET home page. */
router.get('/', function(req, res) {
  res.json({error: false})
});

router.post('/update', checkSession, usersController.updateUser);
router.post('/get-by-id', checkSession, usersController.getById);
router.post('/list', checkSession, checkRol(['ADMIN']), usersController.getList);
router.post('/delete', checkSession, checkRol(['ADMIN']), usersController.deleteUser);

module.exports = router;
