const Producto = require("../models/producto.model");

// crearProducto
const crearProducto = async (req, res) => {
  const { nombre, precio, categoria } = req.body;

  if (!nombre || precio == null || !categoria) {
    return res.status(400).json({ message: "Los campos nombre, precio y categoria son obligatorios" });
  }

  try {
    const nuevoProducto = await Producto.create(req.body);
    res.status(201).json({ message: "Producto creado correctamente", producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ message: "Error al crear producto", error: error.message });
  }
};

// obtenerProductos (opcionalmente filtra por ?categoria=plato_principal)
const obtenerProductos = async (req, res) => {
  try {
    const { categoria } = req.query;
    const where = categoria ? { categoria } : {};

    const productos = await Producto.findAll({ where });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error: error.message });
  }
};

// obtenerProductoPorId
const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto", error: error.message });
  }
};

// actualizarProducto
const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    await producto.update(req.body);
    res.json({ message: "Producto actualizado correctamente", producto });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar producto", error: error.message });
  }
};

// eliminarProducto
const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    await producto.destroy();
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error: error.message });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
};