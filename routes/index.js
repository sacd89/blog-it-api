const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.json({error: false})
});

router.post('/login', usersController.login);
router.post('/register', usersController.register);

module.exports = router;
