const express = require("express");
const router = express.Router();
const { abrirCaja, obtenerCajaActiva, obtenerTodasLasCajas, cerrarCaja } = require("../controllers/caja.controller");

router.post("/abrir", abrirCaja);
router.get("/activa", obtenerCajaActiva);
router.get("/", obtenerTodasLasCajas);
router.put("/cerrar", cerrarCaja);

module.exports = router;
