const express = require("express");
const router = express.Router();
const { registrarPago, obtenerPagos, recibirWebhookMP } = require("../controllers/pago.controller");

router.post("/", registrarPago);
router.get("/", obtenerPagos);
router.post("/webhook", recibirWebhookMP);

module.exports = router;
