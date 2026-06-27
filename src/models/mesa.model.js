const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Mesa = sequelize.define("Mesa", {
  idMesa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: "LIBRE",
  }
}, {
  tableName: "mesas",
  timestamps: false,
});

module.exports = Mesa;
