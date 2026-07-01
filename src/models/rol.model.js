const { DataTypes } = require('sequelize');
const sequelize = require('./../../config/database'); // Asegúrate de que la ruta apunte a tu archivo
const Usuario = require('./usuario.model');
const Funcion = require('./funcion.model');
const Rol = sequelize.define('Rol', {
    // Sequelize crea un campo 'id' autoincrementable automáticamente, no hace falta ponerlo
    rolId: { type: DataTypes.INTEGER, allowNull: false},
    tipo: { type: DataTypes.STRING, allowNull: false },
    nombre: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'roles', // Nombre de la tabla en minúsculas y plural
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
});

Rol.belongsToMany(Usuario, {
    through:"usuario_roles",
    foreignKey: "rolId",
    otherKey: "usuarioId"
})

Rol.belongsToMany(Funcion, {
    through:"roles_funciones",
    foreignKey: "rolId",
    otherKey: "funcionId"
})

module.exports = Rol;