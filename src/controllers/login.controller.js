const Usuario = require('./../models/usuario.model'); // Asegúrate de usar la ruta correcta a tu modelo
const { getUsuarioId } = require('./usuario.controller');
const loginCtrl = {};

loginCtrl.getUsuarioEmailPassword = async (req, res) => {
    try {
        const verif = await Usuario.findOne({
            where: {
                email: req.body.email
            }
        })
        if(!verif)
            res.status(404).json({ status: '0', msg: "Usuario no encontrado"})

        const comparacion = await bcrypt.compare(req.body.password,verif.password)

        if(!comparacion)
            res.status(404).json({ status: '0', msg: "Contraseña Incorrecta"})
        else
            if(!verif)
            res.status(200).json({ status: '1', msg: "Ingreso existoso"})

    } catch (error) {
        res.status(500).json({ status: '0', msg: 'Error al obtener el usuario.' });
    }
};

module.exports = loginCtrl