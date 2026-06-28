const express = require("express");
const router = express.Router();
const { obtenerMesas, obtenerMesaPorId, crearMesa, liberarMesa, cambiarEstado, eliminarMesa } = require("../controllers/mesa.controller");

router.get("/", obtenerMesas);
router.get("/:id", obtenerMesaPorId);
router.post("/", crearMesa);
router.put("/:id/liberar", liberarMesa);
router.put("/:id/estado", cambiarEstado);
router.delete("/:id", eliminarMesa);

module.exports = router;