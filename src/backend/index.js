//=======[ Settings, Imports & Data ]==========================================

var PORT = 3000;

const express = require('express');
const app = express();
const pool = require('./mysql-connector');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
const fs = require('fs');
const mqttClient = require('./mqtt-handler');
const { authRouter, comparePasswords } = require('./routes/auth');
const { JWT_Secret } = require('./routes/auth');
const { dispositivosRouter, ultMedicionRouter, graficoRouter, medicionesRouter, deleteDispositivoRouter, estadoConexionRouter } = require('./routes/dispositivos');

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

const auth = function (req, res, next) {
  let autHeader = req.headers.authorization || '';
  if (autHeader.startsWith('Bearer ')) {
    token = autHeader.split(' ')[1];
  } else {
    res.status(401).send({ message: 'No hay token en la cabecera' });
  }
  jwt.verify(token, JWT_Secret, function (err) {
    if (err) {
      console.log('error en el token');
      res.status(403).send({ meesage: 'Token inválido' });
    }
  });
  next();
};


// to parse application/json
app.use(express.json());
// to serve static files
app.use(express.static('/home/node/app/static/'));
// to enable cors
app.use(cors(corsOptions));


//=======[ Main module code ]==================================================

mqttClient.on('message', async (topic, message) => {
  console.log('Mensaje recibido en el topic:', topic);
  console.log('Contenido del mensaje:', message.toString());
  if (topic === "/home/temperatura/data" || topic === "/home/dimmer/data") {
    let connection; // Definir la variable connection fuera del bloque try
    try {
      const mensaje = JSON.parse(message.toString());
      const medicion = {
        dispositivoId: mensaje.ID,
        tipo: mensaje.tipo,
        fecha: mensaje.time,
        valor: mensaje.valor,
        set_point: mensaje.set_point,
        modo: mensaje.modo,
        salida: mensaje.salida,
      };
      console.log('Mensaje convertido a JSON');
      connection = await pool.getConnection();
      const result = await connection.query(
        'INSERT INTO Mediciones (dispositivoId, tipo, fecha, valor, set_point, modo, salida) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [medicion.dispositivoId, medicion.tipo, medicion.fecha, medicion.valor, medicion.set_point, medicion.modo, medicion.salida]
      );
      console.log('Medición insertada correctamente en la base de datos.');
    } catch (error) {
      console.error('Error al insertar la medición en la base de datos:', error);
    } finally {
      if (connection) {
        connection.release(); // Liberar la conexión en el bloque finally
      }
    }
  }
});

app.use('/', authRouter);

app.use('/dispositivos', dispositivosRouter);
app.use('/ultmedicion', ultMedicionRouter);
app.use('/grafico', graficoRouter);
app.use('/dispositivos', medicionesRouter);
app.use('/deletedispositivo', deleteDispositivoRouter);
app.use('/estadoconexion', estadoConexionRouter);

app.listen(PORT, function (req, res) {
  console.log('NodeJS API running correctly on:', PORT);
});

//=======[ End of Main module code ]================================================-------
