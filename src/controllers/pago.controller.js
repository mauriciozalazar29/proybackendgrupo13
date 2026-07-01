const Pago = require("../models/pago.model");
const Pedido = require("../models/pedido.model");
const Caja = require("../models/caja.model");
const Mesa = require("../models/mesa.model");
const sequelize = require("../../config/database");

// SDK de MercadoPago
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// registrarPago
const registrarPago = async (req, res) => {
  const { idPedido, metodoPago, referenciaExterna } = req.body;

  if (!idPedido || !metodoPago) {
    return res.status(400).json({ message: "idPedido y metodoPago son obligatorios" });
  }

  const t = await sequelize.transaction();

  try {
    //  verificar Pedido
    const pedido = await Pedido.findByPk(idPedido, { transaction: t });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (["PAGADO", "CANCELADO"].includes(pedido.estado)) {
      await t.rollback();
      return res.status(400).json({ message: `El pedido ya está ${pedido.estado}` });
    }

    // verificar Caja Abierta
    const cajaAbierta = await Caja.findOne({ where: { estado: "ABIERTA" }, transaction: t });
    if (!cajaAbierta) {
      await t.rollback();
      return res.status(400).json({ message: "No hay una caja abierta para registrar el pago" });
    }

    //  MERCADOPAGO
    if (metodoPago === "MERCADOPAGO") {
      await t.rollback(); // solo generamos el link

      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const preference = new Preference(client);

      const response = await preference.create({
        body: {
          items: [
            {
              id: idPedido.toString(),
              title: `Pedido Nro ${idPedido} - RestoYa`,
              quantity: 1,
              unit_price: Number(pedido.total || 0)
            }
          ],
          external_reference: idPedido.toString(), // Clave para que MP nos devuelva el ID de nuestro pedido en el webhook
          notification_url: `${process.env.NGROK_URL}/api/pagos/webhook`
        }
      });

      return res.status(200).json({
        message: "Link de MercadoPago generado. El pago se registrará cuando el cliente pague.",
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point
      });
    }

    // efectivo, tarjeta, transferencia, etc
    const nuevoPago = await Pago.create({
      idPedido,
      idCaja: cajaAbierta.idCaja,
      metodoPago,
      monto: pedido.total || 0,
      referenciaExterna
    }, { transaction: t });

    // actualizar Estado Pedido y liberar mesa
    await pedido.update({ estado: "PAGADO" }, { transaction: t });
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

// webhook para recibir notificaciones de ercadoPago
const recibirWebhookMP = async (req, res) => {
  // para esta simulación manual le vamos a mandar el idPedido por el body
  const { idPedido } = req.body;

  if (!idPedido) {
    return res.status(400).json({ message: "idPedido es requerido para simular el webhook" });
  }

  const t = await sequelize.transaction();

  try {
    const pedido = await Pedido.findByPk(idPedido, { transaction: t });
    if (!pedido || pedido.estado === "PAGADO") {
      await t.rollback();
      return res.status(400).json({ message: "Pedido no válido o ya pagado" });
    }

    const cajaAbierta = await Caja.findOne({ where: { estado: "ABIERTA" }, transaction: t });
    if (!cajaAbierta) {
      await t.rollback();
      return res.status(400).json({ message: "No hay caja abierta" });
    }

    // registramos el pago simulando que vino de MercadoPago
    await Pago.create({
      idPedido: pedido.idPedido,
      idCaja: cajaAbierta.idCaja,
      metodoPago: "MERCADOPAGO",
      monto: pedido.total || 0,
      referenciaExterna: "simulacion_postman"
    }, { transaction: t });

    // actualizamos pedido y liberamos mesa
    await pedido.update({ estado: "PAGADO" }, { transaction: t });
    if (pedido.idMesa) {
      await Mesa.update({ estado: "LIBRE" }, { 
        where: { idMesa: pedido.idMesa },
        transaction: t 
      });
    }

    await t.commit();
    res.status(200).json({ message: "Webhook procesado con éxito. Pago registrado y mesa liberada." });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Error en Webhook", error: error.message });
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

module.exports = { registrarPago, recibirWebhookMP, obtenerPagos };
