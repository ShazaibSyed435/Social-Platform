// src/services/auth/auth.routes.js
const router = require('express').Router();
const validate = require('../../shared/middlewares/validate.middleware');
const { validateRegister, validateLogin } = require('./auth.model');
const { register, login, refresh, logout } = require('./auth.controller');

router.post('/register', validate(validateRegister), register);
router.post('/login',    validate(validateLogin),    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);

module.exports = router;