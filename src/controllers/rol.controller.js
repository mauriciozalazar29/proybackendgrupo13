const Rol = require('./../models/rol.model'); // Asegúrate de usar la ruta correcta a tu modelo
const rolCtrl = {};
// Obtener todos los empleados
rolCtrl.getRol = async (req, res) => {
    try {
        const rol = await Rol.findAll()
        res.json(rol);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener los roles.' });
    }
};
// Crear un nuevo empleado
rolCtrl.createRol = async (req, res) => {
    try {
        // Sequelize usa .create() para instanciar y guardar en un solo paso
        await Rol.create(req.body);
        res.json({ status: '1', msg: 'Rol guardado.' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando operacion.' });
    }
};

rolCtrl.getRolId = async (req, res) => {
    try {
        // Buscamos por la clave primaria (id numérico)
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) {
            return res.status(404).json({ status: '0', msg: 'Rol no encontrado.' });
        }
        res.json(rol);
    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener el rol.' });
    }
};

rolCtrl.updateRol = async (req, res) => {
    try {
        await Rol.update(req.body, {
            where: { id: req.body.id }
        });
        res.json({ status: '1', msg: 'Rol actualizado' });
    } catch (error) {
        res.status(400).json({ status: '0', msg: 'Error procesando la operacion' });
    }
}

module.exports = rolCtrl