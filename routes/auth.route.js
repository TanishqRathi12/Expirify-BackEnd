const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');

const { Router } = express;

const router = Router();

const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login , authMiddleware);

module.exports = router;