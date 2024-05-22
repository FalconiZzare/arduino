const { SerialPort } = require('serialport');
const { Readline } = require('@serialport/parser-readline');
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const pool = require('./db');  // Import the database connection

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

const portName = 'COM1';

const initializeSerialPort = async () => {
  try {
    const ports = await SerialPort.list();
    const portInfo = ports.find(port => port.path === portName);

    if (!portInfo) {
      throw new Error(`Port ${portName} not found. Available ports are: ${ports.map(p => p.path).join(', ')}`);
    }

    const port = new SerialPort(portName, { baudRate: 9600 });
    const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

    // When data is received from the Arduino, send it to the client
    parser.on('data', data => {
      console.log(`Received data: ${data}`);
      io.emit('rfidData', data);
    });

    console.log(`Serial port ${portName} initialized successfully.`);
  } catch (error) {
    console.error(`Failed to initialize serial port: ${error.message}`);
  }
};

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})


// Serve static files from the React app
app.use(express.static('build'));

// Route to get user info based on RFID data
app.get('/api/user-info/:rfid', (req, res) => {
  const { rfid } = req.params;

  const query = 'SELECT * FROM student_info WHERE student_id = ?';
  pool.query(query, [rfid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
