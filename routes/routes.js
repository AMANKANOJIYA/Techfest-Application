const express = require('express');
const router = express.Router();
const controller = require('../controller/controller.js');

router.get('/', controller.render('home'));

router.get('/sign', controller.signIn);
router.get('/callback', controller.callback);

router.get('/profile', controller.profile);
router.get('/sensitive', controller.sensitive);

module.exports = router;