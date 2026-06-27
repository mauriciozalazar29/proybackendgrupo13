const express = require("express");
const router = express.Router();
const { obtenerPedidos, obtenerPedidoPorId, crearPedido, cambiarEstado, cancelar } = require("../controllers/pedido.controller");

router.get("/", obtenerPedidos);
router.get("/:id", obtenerPedidoPorId);
router.post("/", crearPedido);
router.put("/:id/estado", cambiarEstado);
router.delete("/:id", cancelar);

module.exports = router;