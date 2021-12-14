const express = require('express');
const router = express.Router();
const controller = require('../controller/controller.js');

router.get('/', controller.render('home'));

router.get('/signup', controller.render('signup'));
router.post('/signup', controller.signup);

router.get('/login', controller.render('login'));
router.post('/login', controller.login);

router.get('/verification', controller.render('mfa'));
router.post('/verification', controller.verification);

router.get('/activate', controller.render('mfa'));
router.post('/activate', controller.activate);

router.get('/profile', controller.profile);

module.exports = router;