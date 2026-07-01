const loginCtrl = require('./../controllers/login.controller');
//creamos el manejador de rutas
const express = require('express');
const router = express.Router();

router.get('/login', loginCtrl.getUsuarioEmailPassword);


module.exports = router;