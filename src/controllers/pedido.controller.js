const Pedido = require("../models/pedido.model");
const Mesa = require("../models/mesa.model");

// crearPedido
const crearPedido = async (req, res) => {
  const { idMesa } = req.body;
  
  if (!idMesa) {
    return res.status(400).json({ message: "El idMesa es obligatorio para crear un pedido LOCAL." });
  }

  try {
    // Forzamos el tipoPedido a LOCAL
    const nuevoPedido = await Pedido.create({ tipoPedido: 'LOCAL', idMesa });

    // Siempre pasamos la mesa a OCUPADA
    await Mesa.update({ estado: 'OCUPADA' }, { where: { idMesa: idMesa } });

    const pedidoCreado = await Pedido.findByPk(nuevoPedido.idPedido, {
      include: [{ model: Mesa, as: "mesa" }]
    });

    res.status(201).json({ message: "Pedido creado correctamente", pedido: pedidoCreado });
  } catch (error) {
    res.status(500).json({ message: "Error al crear pedido", error: error.message });
  }
};

// obtenerPedidos 
const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [{ model: Mesa, as: "mesa" }],
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error: error.message });
  }
};


// obtenerPedidoPorId
const obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [{ model: Mesa, as: "mesa" }],
    });
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el pedido", error: error.message });
  }
};

// cambiarEstado actualiza el estado y libera la mesa si corresponde
const cambiarEstado = async (req, res) => {
  const estadosValidos = ["PENDIENTE", "EN_COCINA", "LISTO_PARA_ENTREGA", "ENTREGADO", "PAGADO", "CANCELADO"];
  const { estado } = req.body;

  if (!estadosValidos.includes(estado))
    return res.status(400).json({ message: "Estado inválido" });

  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    await pedido.update({ estado });

    // Si se paga o se cancela, liberar la mesa
    if (["PAGADO", "CANCELADO"].includes(estado) && pedido.idMesa) {
      await Mesa.update({ estado: "LIBRE" }, { where: { idMesa: pedido.idMesa } });
    }

    res.json({ message: `Estado actualizado a ${estado}`, pedido });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar estado", error: error.message });
  }
};

// cancelar marca pedido como CANCELADO y libera la mesa
const cancelar = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    if (pedido.estado === "PAGADO")
      return res.status(400).json({ message: "No se puede cancelar un pedido ya pagado" });

    await pedido.update({ estado: "CANCELADO" });

    if (pedido.idMesa) {
      await Mesa.update({ estado: "LIBRE" }, { where: { idMesa: pedido.idMesa } });
    }

    res.json({ message: "Pedido cancelado correctamente", pedido });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar pedido", error: error.message });
  }
};

module.exports = { obtenerPedidos, obtenerPedidoPorId, crearPedido, cambiarEstado, cancelar };