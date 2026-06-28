require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

var app = express();

//middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:4200" }));

//Cargamos el modulo de direccionamiento de rutas
app.use('/api/pedidos', require('./src/routes/pedido.route'));
<<<<<<< HEAD
app.use('/api/productos', require('./src/routes/producto.route'));
//app.use('/api/detalles-pedidos', require('./src/routes/detallePedido.route'));
=======
app.use('/api/mesas', require('./src/routes/mesa.route'));

>>>>>>> origin/develop
//setting
app.set('port', process.env.PORT || 3000);

// Sincronizar Base de Datos y arrancar el servidor
//.sync() con alter: true actualiza las tablas si hubo cambios en los modelos
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Tablas de PostgreSQL sincronizadas");
    app.listen(app.get("port"), () => {
      console.log(`Server started on port`, app.get("port"));
    });
  })
  .catch((err) => {
    console.error(
      "No se pudo iniciar el servidor debido a un error en la BD:",
      err,
    );
  });