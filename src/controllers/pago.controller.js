const Pago = require("../models/pago.model");
const Pedido = require("../models/pedido.model");
const Caja = require("../models/caja.model");
const Mesa = require("../models/mesa.model");
const sequelize = require("../../config/database");

// registrarPago
const registrarPago = async (req, res) => {
  const { idPedido, metodoPago, referenciaExterna } = req.body;

  if (!idPedido || !metodoPago) {
    return res.status(400).json({ message: "idPedido y metodoPago son obligatorios" });
  }

  const t = await sequelize.transaction();

  try {
    // verificar pedido
    const pedido = await Pedido.findByPk(idPedido, { transaction: t });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (["PAGADO", "CANCELADO"].includes(pedido.estado)) {
      await t.rollback();
      return res.status(400).json({ message: `El pedido ya está ${pedido.estado}` });
    }

    // verificar caja abierta
    const cajaAbierta = await Caja.findOne({ where: { estado: "ABIERTA" }, transaction: t });
    if (!cajaAbierta) {
      await t.rollback();
      return res.status(400).json({ message: "No hay una caja abierta para registrar el pago" });
    }

    // crear pago
    const nuevoPago = await Pago.create({
      idPedido,
      idCaja: cajaAbierta.idCaja,
      metodoPago,
      monto: pedido.total || 0, // toma el total del pedido
      referenciaExterna
    }, { transaction: t });

    // actualizar estado pedido
    await pedido.update({ estado: "PAGADO" }, { transaction: t });

    // liberar mesa si corresponde
    if (pedido.idMesa) {
      await Mesa.update({ estado: "LIBRE" }, { 
        where: { idMesa: pedido.idMesa },
        transaction: t 
      });
    }

    await t.commit();
    res.status(201).json({ message: "Pago registrado correctamente", pago: nuevoPago });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Error al registrar pago", error: error.message });
  }
};

// obtenerPagos
const obtenerPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      include: [
        { model: Pedido, as: "pedido" },
        { model: Caja, as: "caja" }
      ]
    });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pagos", error: error.message });
  }
};

module.exports = { registrarPago, obtenerPagos };
