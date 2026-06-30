const express = require("express");
const router = express.Router();
const { registrarPago, obtenerPagos } = require("../controllers/pago.controller");

router.post("/", registrarPago);
router.get("/", obtenerPagos);

module.exports = router;
